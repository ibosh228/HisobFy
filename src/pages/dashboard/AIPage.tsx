import { useRef, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../context/AuthContext'
import { parseFile, guessColumn, guessIncomeValue } from '../../lib/fileParser'
import { buildTransactionsFromRows, insertTransactions, type ColumnMapping } from '../../lib/business'

type Msg = { role: 'user' | 'ai'; text: string }

const suggested = [
  'Foyda qanday?',
  'Eng katta xarajat qaysi toifada?',
  'Daromadni qanday oshirsam bo‘ladi?',
  'Xarajatlarni qisqartirish uchun nima qilsam bo‘ladi?',
]

const ALLOWED_EXTENSIONS = ['.xlsx', '.csv']

export default function AIPage() {
  const { business } = useAuth()
  const [messages, setMessages] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [importing, setImporting] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const ask = async (question: string) => {
    if (!question.trim() || loading) return
    const newHistory = [...messages, { role: 'user' as const, text: question }]
    setMessages(newHistory)
    setInput('')
    setLoading(true)

    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData.session?.access_token

      // Avval bu xabar tranzaksiya yozuvi emasmi, tekshiramiz (masalan "500000 taksiga ketdi")
      if (business) {
        try {
          const extractRes = await fetch('/api/extract-transaction', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ message: question }),
          })

          if (extractRes.ok) {
            const extracted = await extractRes.json()
            if (extracted.isTransaction) {
              const { error } = await insertTransactions(business.id, [
                {
                  date: extracted.date,
                  description: extracted.description,
                  category: extracted.category,
                  type: extracted.type,
                  amount: extracted.amount,
                  currency: 'UZS',
                },
              ])

              if (!error) {
                const typeLabel = extracted.type === 'income' ? 'Daromad' : 'Xarajat'
                setMessages((m) => [
                  ...m,
                  {
                    role: 'ai',
                    text: `✅ Yozib qo‘ydim: ${extracted.description} — ${Math.round(extracted.amount).toLocaleString('en-US')} UZS (${typeLabel}, ${extracted.category}, ${extracted.date})`,
                  },
                ])
                return
              }
            }
          }
        } catch {
          /* extraction failed, fall through to normal Q&A */
        }
      }

      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ question, history: messages }),
      })

      const data = await res.json()

      if (!res.ok) {
        setMessages((m) => [...m, { role: 'ai', text: data.error ?? 'Xatolik yuz berdi.' }])
        return
      }

      setMessages((m) => [...m, { role: 'ai', text: data.answer }])
    } catch {
      setMessages((m) => [...m, { role: 'ai', text: 'Server bilan bog‘lanishda xatolik yuz berdi.' }])
    } finally {
      setLoading(false)
    }
  }

  const handleFile = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0 || !business) return
    const file = fileList[0]
    const ext = '.' + file.name.split('.').pop()?.toLowerCase()

    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      setMessages((m) => [...m, { role: 'ai', text: 'Faqat .xlsx yoki .csv fayllarni qabul qilaman.' }])
      return
    }

    setMessages((m) => [...m, { role: 'user', text: `📎 ${file.name}` }])
    setImporting(true)

    try {
      const parsed = await parseFile(file)
      if (parsed.headers.length === 0 || parsed.rows.length === 0) {
        setMessages((m) => [...m, { role: 'ai', text: 'Faylda ma‘lumot topilmadi. Birinchi qator ustun nomlari bo‘lishi kerak.' }])
        return
      }

      let mapping: ColumnMapping | null = null
      let mappingNote = ''

      try {
        const { data: sessionData } = await supabase.auth.getSession()
        const token = sessionData.session?.access_token

        const classifyRes = await fetch('/api/classify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ headers: parsed.headers, sampleRows: parsed.rows.slice(0, 8) }),
        })

        if (classifyRes.ok) {
          const { mapping: aiMapping } = await classifyRes.json()
          if (aiMapping?.date && aiMapping?.description && aiMapping?.amount) {
            if (aiMapping.type_column && aiMapping.income_value) {
              mapping = {
                date: aiMapping.date,
                description: aiMapping.description,
                category: aiMapping.category ?? aiMapping.description,
                amount: aiMapping.amount,
                typeMode: 'column',
                typeColumn: aiMapping.type_column,
                incomeValue: aiMapping.income_value,
              }
              mappingNote = `AI ustunlarni tahlil qildi: "${aiMapping.type_column}" ustuni bo‘yicha, "${aiMapping.income_value}" = Daromad deb aniqladi.`
            } else {
              mapping = {
                date: aiMapping.date,
                description: aiMapping.description,
                category: aiMapping.category ?? aiMapping.description,
                amount: aiMapping.amount,
                typeMode: 'sign',
              }
              mappingNote = 'AI ustunlarni tahlil qildi: alohida "Tur" ustuni topilmadi, shuning uchun summa belgisidan foydalandi (musbat = daromad, manfiy = xarajat).'
            }
          }
        }
      } catch {
        /* AI classify failed, fall back below */
      }

      if (!mapping) {
        const dateCol = guessColumn(parsed.headers, 'date')
        const descCol = guessColumn(parsed.headers, 'description')
        const catCol = guessColumn(parsed.headers, 'category')
        const amountCol = guessColumn(parsed.headers, 'amount')
        const typeCol = guessColumn(parsed.headers, 'type')

        if (!dateCol || !descCol || !amountCol) {
          setMessages((m) => [
            ...m,
            {
              role: 'ai',
              text: 'Ustunlarni aniqlay olmadim (Sana, Tavsif yoki Summa topilmadi). Iltimos, "Ma‘lumotlar" sahifasidan yuklang — u yerda ustunlarni qo‘lda moslashtirish mumkin.',
            },
          ])
          return
        }

        if (typeCol) {
          const distinctValues = Array.from(new Set(parsed.rows.map((r) => (r[typeCol] ?? '').trim()).filter(Boolean)))
          const incomeValue = guessIncomeValue(distinctValues)
          if (incomeValue) {
            mapping = { date: dateCol, description: descCol, category: catCol ?? descCol, amount: amountCol, typeMode: 'column', typeColumn: typeCol, incomeValue }
            mappingNote = `(zaxira usul) "${typeCol}" ustuni bo‘yicha, "${incomeValue}" = Daromad deb aniqladim.`
          } else {
            mapping = { date: dateCol, description: descCol, category: catCol ?? descCol, amount: amountCol, typeMode: 'sign' }
            mappingNote = '(zaxira usul) Summa belgisidan foydalandim.'
          }
        } else {
          mapping = { date: dateCol, description: descCol, category: catCol ?? descCol, amount: amountCol, typeMode: 'sign' }
          mappingNote = '(zaxira usul) Summa belgisidan foydalandim.'
        }
      }

      const { valid, invalidCount } = buildTransactionsFromRows(parsed.rows, mapping)

      if (valid.length === 0) {
        setMessages((m) => [...m, { role: 'ai', text: 'Hech qanday yaroqli qator topilmadi. Faylni "Ma‘lumotlar" sahifasidan qo‘lda moslashtirib yuklab ko‘ring.' }])
        return
      }

      const { error } = await insertTransactions(business.id, valid)
      if (error) {
        setMessages((m) => [...m, { role: 'ai', text: 'Ma‘lumotni saqlashda xatolik yuz berdi.' }])
        return
      }

      const summary = `${valid.length} ta yozuv muvaffaqiyatli yuklandi.${invalidCount > 0 ? ` ${invalidCount} ta qator o‘tkazib yuborildi (to‘liq emas).` : ''}\n\n${mappingNote}\n\nAgar bu noto‘g‘ri bo‘lsa, "Ma‘lumotlar" sahifasidan o‘chirib, qo‘lda moslashtirib qayta yuklashingiz mumkin. Endi men shu ma‘lumotlar haqida savollaringizga javob bera olaman.`
      setMessages((m) => [...m, { role: 'ai', text: summary }])
    } catch {
      setMessages((m) => [...m, { role: 'ai', text: 'Faylni o‘qib bo‘lmadi. Format buzilgan bo‘lishi mumkin.' }])
    } finally {
      setImporting(false)
    }
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-5">
      <div
        className="flex items-center gap-2 rounded-lg border px-3 py-2 text-[12px]"
        style={{ borderColor: 'var(--accent-border)', backgroundColor: 'var(--accent-soft)', color: 'var(--accent)' }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8v4M12 16h.01" />
        </svg>
        Javoblar sizning haqiqiy moliyaviy ma‘lumotlaringiz asosida beriladi
      </div>

      <div className="flex min-h-[200px] flex-col gap-3 rounded-xl border p-5" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}>
        {messages.length === 0 && (
          <p className="text-[13px]" style={{ color: 'var(--text-tertiary)' }}>
            Biznesingiz haqida savol bering, pastdagi takliflardan birini tanlang, yoki Excel/CSV faylni to‘g‘ridan-to‘g‘ri shu yerga biriktiring.
          </p>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className="max-w-[85%] whitespace-pre-wrap rounded-lg px-3.5 py-2.5 text-[13px] leading-relaxed"
              style={
                m.role === 'user'
                  ? { backgroundColor: 'var(--accent)', color: 'white' }
                  : { backgroundColor: 'var(--bg-elevated)', color: 'var(--text-primary)', border: '1px solid var(--border)' }
              }
            >
              {m.text}
            </div>
          </div>
        ))}
        {(loading || importing) && (
          <div className="flex justify-start">
            <div className="rounded-lg border px-3.5 py-2.5 text-[13px]" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-elevated)', color: 'var(--text-tertiary)' }}>
              {importing ? 'Fayl tahlil qilinmoqda…' : 'Hisobfy tahlil qilmoqda…'}
            </div>
          </div>
        )}
      </div>

      <div>
        <p className="mb-2 text-[12px] font-medium" style={{ color: 'var(--text-tertiary)' }}>
          Taklif qilingan savollar
        </p>
        <div className="flex flex-wrap gap-2">
          {suggested.map((q) => (
            <button
              key={q}
              onClick={() => ask(q)}
              disabled={loading || importing}
              className="rounded-full border px-3.5 py-1.5 text-[12.5px] transition-colors duration-150 disabled:opacity-50"
              style={{ borderColor: 'var(--border-strong)', color: 'var(--text-secondary)' }}
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          ask(input)
        }}
        className="flex gap-2"
      >
        <input
          ref={fileRef}
          type="file"
          accept=".xlsx,.csv"
          className="hidden"
          onChange={(e) => {
            handleFile(e.target.files)
            e.target.value = ''
          }}
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={loading || importing}
          className="flex shrink-0 items-center justify-center rounded-lg border px-3 disabled:opacity-50"
          style={{ borderColor: 'var(--border-strong)', color: 'var(--text-secondary)' }}
          aria-label="Fayl biriktirish"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
          </svg>
        </button>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Savolingizni yozing yoki fayl biriktiring…"
          className="flex-1 rounded-lg border px-3.5 py-2.5 text-[13px] outline-none"
          style={{ borderColor: 'var(--border-strong)', backgroundColor: 'var(--surface)', color: 'var(--text-primary)' }}
        />
        <button
          type="submit"
          disabled={loading || importing || !input.trim()}
          className="rounded-lg px-4 py-2.5 text-[13px] font-semibold text-white disabled:opacity-50"
          style={{ backgroundColor: 'var(--accent)' }}
        >
          Yuborish
        </button>
      </form>
    </div>
  )
}
