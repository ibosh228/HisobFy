import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { parseFile, guessColumn, type ParsedFile } from '../../lib/fileParser'
import { buildTransactionsFromRows, insertTransactions, type ColumnMapping } from '../../lib/business'

const ALLOWED_EXTENSIONS = ['.xlsx', '.csv']
type Step = 'upload' | 'mapping' | 'result'

export default function DataPage() {
  const { business } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)

  const [dragOver, setDragOver] = useState(false)
  const [step, setStep] = useState<Step>('upload')
  const [fileName, setFileName] = useState('')
  const [parsed, setParsed] = useState<ParsedFile | null>(null)
  const [mapping, setMapping] = useState<ColumnMapping | null>(null)
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<{ validCount: number; invalidCount: number } | null>(null)
  const [parseError, setParseError] = useState<string | null>(null)

  const reset = () => {
    setStep('upload')
    setFileName('')
    setParsed(null)
    setMapping(null)
    setResult(null)
    setParseError(null)
  }

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return
    const file = fileList[0]
    const ext = '.' + file.name.split('.').pop()?.toLowerCase()

    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      showToast('Faqat .xlsx yoki .csv fayllar qabul qilinadi', 'error')
      return
    }

    setFileName(file.name)
    setParseError(null)

    try {
      const result = await parseFile(file)
      if (result.headers.length === 0 || result.rows.length === 0) {
        setParseError('Faylda ma‘lumot topilmadi. Birinchi qator ustun nomlari bo‘lishi kerak.')
        return
      }
      setParsed(result)
      setMapping({
        date: guessColumn(result.headers, 'date') ?? result.headers[0],
        description: guessColumn(result.headers, 'description') ?? result.headers[0],
        category: guessColumn(result.headers, 'category') ?? result.headers[0],
        amount: guessColumn(result.headers, 'amount') ?? result.headers[0],
        typeMode: guessColumn(result.headers, 'type') ? 'column' : 'sign',
        typeColumn: guessColumn(result.headers, 'type') ?? undefined,
        incomeValue: undefined,
      })
      setStep('mapping')
    } catch {
      setParseError('Faylni o‘qib bo‘lmadi. Fayl buzilgan yoki noto‘g‘ri formatda bo‘lishi mumkin.')
    }
  }

  const distinctTypeValues = mapping?.typeColumn && parsed
    ? Array.from(new Set(parsed.rows.map((r) => (r[mapping.typeColumn!] ?? '').trim()).filter(Boolean))).slice(0, 12)
    : []

  const handleImport = async () => {
    if (!parsed || !mapping || !business) return
    setImporting(true)

    const { valid, invalidCount } = buildTransactionsFromRows(parsed.rows, mapping)

    if (valid.length === 0) {
      setImporting(false)
      setResult({ validCount: 0, invalidCount })
      setStep('result')
      return
    }

    const { error } = await insertTransactions(business.id, valid)
    setImporting(false)

    if (error) {
      showToast('Ma‘lumotni saqlashda xatolik yuz berdi', 'error')
      return
    }

    setResult({ validCount: valid.length, invalidCount })
    setStep('result')
    showToast('Ma‘lumot muvaffaqiyatli yuklandi')
  }

  return (
    <div className="flex flex-col gap-6">
      {step === 'upload' && (
        <>
          <div
            className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-14 text-center transition-colors duration-150"
            style={{ borderColor: dragOver ? 'var(--accent)' : 'var(--border-strong)', backgroundColor: dragOver ? 'var(--accent-soft)' : 'var(--surface)' }}
            onDragOver={(e) => {
              e.preventDefault()
              setDragOver(true)
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault()
              setDragOver(false)
              handleFiles(e.dataTransfer.files)
            }}
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full" style={{ backgroundColor: 'var(--accent-soft)', color: 'var(--accent)' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2M7 9l5-5 5 5M12 4v12" />
              </svg>
            </span>
            <p className="font-display text-[15px] font-semibold" style={{ color: 'var(--text-primary)' }}>
              Excel yoki CSV faylni yuklang
            </p>
            <p className="text-[13px]" style={{ color: 'var(--text-tertiary)' }}>
              Faylni shu yerga tashlang yoki tanlang
            </p>
            <input
              ref={inputRef}
              type="file"
              accept=".xlsx,.csv"
              className="hidden"
              onChange={(e) => {
                handleFiles(e.target.files)
                e.target.value = ''
              }}
            />
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="mt-2 rounded-lg px-4 py-2 text-[13px] font-semibold text-white transition-all duration-200 hover:brightness-110"
              style={{ backgroundColor: 'var(--accent)' }}
            >
              Fayl tanlash
            </button>
          </div>

          {parseError && (
            <div
              className="rounded-lg border px-4 py-3 text-[13px]"
              style={{ borderColor: 'var(--danger)', color: 'var(--danger)', backgroundColor: 'color-mix(in srgb, var(--danger) 10%, transparent)' }}
            >
              {fileName}: {parseError}
            </div>
          )}

          <div className="rounded-lg border px-4 py-3 text-[12.5px]" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)', color: 'var(--text-tertiary)' }}>
            Birinchi qatorda ustun nomlari bo‘lishi kerak (masalan: Sana, Tavsif, Kategoriya, Tur, Summa). Yuklagandan keyin ustunlarni tasdiqlash imkoniyati bo‘ladi.
          </div>
        </>
      )}

      {step === 'mapping' && parsed && mapping && (
        <div className="rounded-xl border p-5 sm:p-6" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}>
          <h2 className="font-display text-[15px] font-semibold" style={{ color: 'var(--text-primary)' }}>
            Ustunlarni moslashtiring
          </h2>
          <p className="mt-1.5 text-[13px]" style={{ color: 'var(--text-tertiary)' }}>
            {fileName} — {parsed.rows.length} qator topildi. Har bir maydon qaysi ustunga mos kelishini tekshiring.
          </p>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {[
              { key: 'date' as const, label: 'Sana' },
              { key: 'description' as const, label: 'Tavsif' },
              { key: 'category' as const, label: 'Kategoriya' },
              { key: 'amount' as const, label: 'Summa' },
            ].map((f) => (
              <label key={f.key} className="flex flex-col gap-1.5 text-sm">
                <span style={{ color: 'var(--text-secondary)' }}>{f.label}</span>
                <select
                  value={mapping[f.key]}
                  onChange={(e) => setMapping({ ...mapping, [f.key]: e.target.value })}
                  className="rounded-lg border px-3 py-2 text-[13px] outline-none"
                  style={{ borderColor: 'var(--border-strong)', backgroundColor: 'var(--bg-elevated)', color: 'var(--text-primary)' }}
                >
                  {parsed.headers.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </label>
            ))}
          </div>

          <div className="mt-5 rounded-lg border p-4" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-elevated)' }}>
            <p className="text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>
              Daromad va xarajatni qanday ajratamiz?
            </p>
            <div className="mt-3 flex flex-col gap-3">
              <label className="flex items-center gap-2 text-[13px]" style={{ color: 'var(--text-secondary)' }}>
                <input
                  type="radio"
                  checked={mapping.typeMode === 'sign'}
                  onChange={() => setMapping({ ...mapping, typeMode: 'sign' })}
                />
                Summa belgisidan (musbat = daromad, manfiy = xarajat)
              </label>
              <label className="flex items-center gap-2 text-[13px]" style={{ color: 'var(--text-secondary)' }}>
                <input
                  type="radio"
                  checked={mapping.typeMode === 'column'}
                  onChange={() => setMapping({ ...mapping, typeMode: 'column' })}
                />
                Alohida ustundan
              </label>

              {mapping.typeMode === 'column' && (
                <div className="ml-6 flex flex-col gap-3 sm:flex-row">
                  <label className="flex flex-col gap-1.5 text-sm">
                    <span style={{ color: 'var(--text-secondary)' }}>Ustun</span>
                    <select
                      value={mapping.typeColumn ?? ''}
                      onChange={(e) => setMapping({ ...mapping, typeColumn: e.target.value, incomeValue: undefined })}
                      className="rounded-lg border px-3 py-2 text-[13px] outline-none"
                      style={{ borderColor: 'var(--border-strong)', backgroundColor: 'var(--surface)', color: 'var(--text-primary)' }}
                    >
                      <option value="">Tanlang</option>
                      {parsed.headers.map((h) => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="flex flex-col gap-1.5 text-sm">
                    <span style={{ color: 'var(--text-secondary)' }}>Qaysi qiymat "Daromad"?</span>
                    <select
                      value={mapping.incomeValue ?? ''}
                      onChange={(e) => setMapping({ ...mapping, incomeValue: e.target.value })}
                      className="rounded-lg border px-3 py-2 text-[13px] outline-none"
                      style={{ borderColor: 'var(--border-strong)', backgroundColor: 'var(--surface)', color: 'var(--text-primary)' }}
                    >
                      <option value="">Tanlang</option>
                      {distinctTypeValues.map((v) => (
                        <option key={v} value={v}>
                          {v}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              onClick={reset}
              className="rounded-lg border px-4 py-2 text-[13px] font-medium"
              style={{ borderColor: 'var(--border-strong)', color: 'var(--text-secondary)' }}
            >
              Bekor qilish
            </button>
            <button
              onClick={handleImport}
              disabled={importing || (mapping.typeMode === 'column' && (!mapping.typeColumn || !mapping.incomeValue))}
              className="rounded-lg px-4 py-2 text-[13px] font-semibold text-white disabled:opacity-50"
              style={{ backgroundColor: 'var(--accent)' }}
            >
              {importing ? 'Yuklanmoqda…' : 'Tasdiqlash va yuklash'}
            </button>
          </div>
        </div>
      )}

      {step === 'result' && result && (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border px-6 py-14 text-center" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}>
          <span
            className="flex h-12 w-12 items-center justify-center rounded-full"
            style={{ backgroundColor: result.validCount > 0 ? 'color-mix(in srgb, var(--success) 15%, transparent)' : 'color-mix(in srgb, var(--danger) 15%, transparent)', color: result.validCount > 0 ? 'var(--success)' : 'var(--danger)' }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              {result.validCount > 0 ? <path d="M20 6L9 17l-5-5" /> : <path d="M18 6L6 18M6 6l12 12" />}
            </svg>
          </span>
          <p className="font-display text-[15px] font-semibold" style={{ color: 'var(--text-primary)' }}>
            {result.validCount > 0 ? `${result.validCount} ta yozuv muvaffaqiyatli yuklandi` : 'Hech qanday yozuv yuklanmadi'}
          </p>
          {result.invalidCount > 0 && (
            <p className="text-[13px]" style={{ color: 'var(--text-tertiary)' }}>
              {result.invalidCount} ta qatorda xato bor edi (sana, summa yoki tavsif to‘liq emas) — ular o‘tkazib yuborildi.
            </p>
          )}
          <div className="mt-3 flex gap-3">
            <button
              onClick={reset}
              className="rounded-lg border px-4 py-2 text-[13px] font-medium"
              style={{ borderColor: 'var(--border-strong)', color: 'var(--text-secondary)' }}
            >
              Yana fayl yuklash
            </button>
            {result.validCount > 0 && (
              <button
                onClick={() => navigate('/dashboard')}
                className="rounded-lg px-4 py-2 text-[13px] font-semibold text-white"
                style={{ backgroundColor: 'var(--accent)' }}
              >
                Umumiy ko‘rinishga o‘tish
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
