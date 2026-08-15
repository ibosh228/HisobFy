import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'

interface UploadedFile {
  id: string
  name: string
  sizeLabel: string
  status: 'Yuklanmoqda…' | 'Qayta ishlangan' | 'Xatolik'
}

const ALLOWED_EXTENSIONS = ['.xlsx', '.csv']

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function DataPage() {
  const { business } = useAuth()
  const { showToast } = useToast()
  const [dragOver, setDragOver] = useState(false)
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const storageKey = business ? `hisobfy-files-${business.id}` : null

  useEffect(() => {
    if (!storageKey) return
    const raw = localStorage.getItem(storageKey)
    if (raw) {
      try {
        setFiles(JSON.parse(raw))
      } catch {
        /* ignore */
      }
    }
  }, [storageKey])

  const persist = (next: UploadedFile[]) => {
    setFiles(next)
    if (storageKey) localStorage.setItem(storageKey, JSON.stringify(next))
  }

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return
    const file = fileList[0]
    const ext = '.' + file.name.split('.').pop()?.toLowerCase()

    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      showToast('Faqat .xlsx yoki .csv fayllar qabul qilinadi', 'error')
      return
    }

    const id = Date.now().toString()
    const entry: UploadedFile = { id, name: file.name, sizeLabel: formatSize(file.size), status: 'Yuklanmoqda…' }
    const next = [entry, ...files]
    persist(next)
    showToast('Fayl qo‘shildi')

    setTimeout(() => {
      persist(next.map((f) => (f.id === id ? { ...f, status: 'Qayta ishlangan' as const } : f)))
    }, 1400)
  }

  const confirmDelete = (id: string) => {
    persist(files.filter((f) => f.id !== id))
    setConfirmDeleteId(null)
    showToast('Fayl o‘chirildi')
  }

  return (
    <div className="flex flex-col gap-6">
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

      <div>
        <h2 className="font-display text-[15px] font-semibold" style={{ color: 'var(--text-primary)' }}>
          Yuklangan fayllar
        </h2>

        {files.length === 0 ? (
          <p className="mt-3 rounded-lg border px-4 py-3 text-[13px]" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)', color: 'var(--text-tertiary)' }}>
            Hali fayl yuklanmagan.
          </p>
        ) : (
          <div className="mt-3 flex flex-col gap-2">
            {files.map((f) => (
              <div
                key={f.id}
                className="flex items-center justify-between rounded-lg border px-4 py-3"
                style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md" style={{ backgroundColor: 'var(--accent-soft)', color: 'var(--accent)' }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <path d="M14 2v6h6" />
                    </svg>
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>
                      {f.name}
                    </p>
                    <p className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
                      {f.sizeLabel}
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <span
                    className="rounded-full px-2.5 py-0.5 text-[11px] font-medium"
                    style={{
                      color: f.status === 'Qayta ishlangan' ? 'var(--success)' : f.status === 'Xatolik' ? 'var(--danger)' : 'var(--text-tertiary)',
                      backgroundColor:
                        f.status === 'Qayta ishlangan'
                          ? 'color-mix(in srgb, var(--success) 12%, transparent)'
                          : f.status === 'Xatolik'
                            ? 'color-mix(in srgb, var(--danger) 12%, transparent)'
                            : 'var(--bg-elevated)',
                    }}
                  >
                    {f.status}
                  </span>
                  <button
                    onClick={() => setConfirmDeleteId(f.id)}
                    className="flex h-7 w-7 items-center justify-center rounded-md"
                    style={{ color: 'var(--text-tertiary)' }}
                    aria-label="O‘chirish"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14z" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="w-full max-w-sm rounded-xl border p-6" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}>
            <p className="font-display text-[15px] font-semibold" style={{ color: 'var(--text-primary)' }}>
              Faylni o‘chirasizmi?
            </p>
            <p className="mt-2 text-[13px]" style={{ color: 'var(--text-tertiary)' }}>
              Bu amalni orqaga qaytarib bo‘lmaydi.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="rounded-lg border px-4 py-2 text-[13px] font-medium"
                style={{ borderColor: 'var(--border-strong)', color: 'var(--text-secondary)' }}
              >
                Bekor qilish
              </button>
              <button
                onClick={() => confirmDelete(confirmDeleteId)}
                className="rounded-lg px-4 py-2 text-[13px] font-semibold text-white"
                style={{ backgroundColor: 'var(--danger)' }}
              >
                O‘chirish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
