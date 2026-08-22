import { useEffect, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { parseFile, guessColumn, guessIncomeValue } from '../../lib/fileParser'
import {
  buildTransactionsFromRows,
  insertTransactions,
  fetchAiMessages,
  saveAiMessage,
  updateTransaction,
  deleteTransaction,
  fetchTransactionById,
  type ColumnMapping,
} from '../../lib/business'

type Msg = { id?: string; role: 'user' | 'ai'; text: string; transactionId?: string | null; deleted?: boolean }

const suggested = [
  'Foyda qanday?',
  'Eng katta xarajat qaysi toifada?',
  'Daromadni qanday oshirsam bo‘ladi?',
  'Xarajatlarni qisqartirish uchun nima qilsam bo‘ladi?',
]

const ALLOWED_EXTENSIONS = ['.xlsx', '.csv']
const PROACTIVE_QUESTION = 'Menga bugungi eng muhim moliyaviy kuzatuvni yoki tendensiyani 2-3 gapda ayting.'

export default function AIPage() {
  const { business } = useAuth()
  const { showToast } = useToast()
  const [messages, setMessages] = useState<Msg[]>([])
  const [historyLoaded, setHistoryLoaded] = useState(false)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [importing, setImporting] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editAmount, setEditAmount] = useState('')
  const [editCategory, setEditCategory] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!business) return
    fetchAiMessages(business.id).then((rows) => {
      const loaded: Msg[] = rows.map((r) => ({ id: r.id, role: r.role, text: r.content, transactionId: r.transaction_id }))
      setMessages(loaded)
      setHistoryLoaded(true)

      const last = rows[rows.length - 1]
      const isStale = !last || Date.now() - new Date(last.created_at).getTime() > 12 * 60 * 60 * 1000
      if (isStale) {
        runProactiveInsight(business.id)
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [business])

  const runProactiveInsight = async (businessId: string) => {
    setLoading(true)
    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData.session?.access_token

      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ question: PROACTIVE_QUESTION, history: [] }),
      })
      const data = await res.json()
      if (res.ok && data.answer) {
        const text = `\uD83D\uDCA1 ${data.answer}`
        const saved = await saveAiMessage(businessId, 'ai', text)
        setMessages((m) => [...m, { id: saved?.id, role: 'ai', text }])
      }
    } catch {
      /* silent — proactive insight is a nice-to-have, not critical */
    } finally {
      setLoading(false)
    }
  }

  const ask = async (question: string) => {
    if (!question.trim() || loading || !business) return
    const newHistory = [...messages, { role: 'user' as const, text: question }]
    setMessages(newHistory)
    setInput('')
    setLoading(true)
    saveAiMessage(business.id, 'user', question)

    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData.session?.access_token

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
              const fresh = await fetchAiMessages(business.id)
              const lastTx = fresh.length // not reliable for id; fetch newest transaction instead
              void lastTx
              const typeLabel = extracted.type === 'income' ? 'Daromad' : 'Xarajat'
              const confirmText = `\u2705 Yozib qo‘ydim: ${extracted.description} — ${Math.round(extracted.amount).toLocaleString('en-US')} UZS (${typeLabel}, ${extracted.category}, ${extracted.date})`

              // Eng yangi mos tranzaksiyani topamiz (endigina qo'shilgani)
              const { data: txRows } = await supabase
                .from('transactions')
                .select('*')
                .eq('business_id', business.id)
                .order('created_at', { ascending: false })
                .limit(1)
              const newTxId = txRows?.[0]?.id ?? null

              const saved = await saveAiMessage(business.id, 'ai', confirmText, newTxId)
              setMessages((m) => [...m, { id: saved?.id, role: 'ai', text: confirmText, transactionId: newTxId }])
              return
            }
          }
        }
      } catch {
        /* extraction failed, fall through to normal Q&A */
      }

      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ question, history: messages.map((m) => ({ role: m.role, text: m.text })) }),
      })

      const data = await res.json()

      if (!res.ok) {
        const errText = data.error ?? 'Xatolik yuz berdi.'
        setMessages((m) => [...m, { role: 'ai', text: errText }])
        return
      }

      const saved = await saveAiMessage(business.id, 'ai', data.answer)
      setMessages((m) => [...m, { id: saved?.id, role: 'ai', text: data.answer }])
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

    const pushAi = async (text: string) => {
      const saved = await saveAiMessage(business.id, 'ai', text)
      setMessages((m) => [...m, { id: saved?.id, role: 'ai', text }])
    }

    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      await pushAi('Faqat .xlsx yoki .csv fayllarni qabul qilaman.')
      return
    }

    const userText = `\uD83D\uDCCE ${file.name}`
    saveAiMessage(business.id, 'user', userText)
    setMessages((m) => [...m, { role: 'user', text: userText }])
    setImporting(true)

    try {
      const parsed = await parseFile(file)
      if (parsed.headers.length === 0 || parsed.rows.length === 0) {
        await pushAi('Faylda ma‘lumot topilmadi. Birinchi qator ustun nomlari bo‘lishi kerak.')
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
              mappingNote = 'AI ustunlarni tahlil qildi: alohida "Tur" ustuni topilmadi, shuning uchun summa belgisidan foydalandi.'
            }
          }
        }
      } catch {
        /* fall back below */
      }

      if (!mapping) {
        const dateCol = guessColumn(parsed.headers, 'date')
        const descCol = guessColumn(parsed.headers, 'description')
        const catCol = guessColumn(parsed.headers, 'category')
        const amountCol = guessColumn(parsed.headers, 'amount')
        const typeCol = guessColumn(parsed.headers, 'type')

        if (!dateCol || !descCol || !amountCol) {
          await pushAi('Ustunlarni aniqlay olmadim. Iltimos, "Ma‘lumotlar" sahifasidan yuklang — u yerda qo‘lda moslashtirish mumkin.')
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
        await pushAi('Hech qanday yaroqli qator topilmadi. Faylni "Ma‘lumotlar" sahifasidan qo‘lda moslashtirib yuklab ko‘ring.')
        return
      }

      const { error } = await insertTransactions(business.id, valid)
      if (error) {
        await pushAi('Ma‘lumotni saqlashda xatolik yuz berdi.')
        return
      }

      const summary = `${valid.length} ta yozuv muvaffaqiyatli yuklandi.${invalidCount > 0 ? ` ${invalidCount} ta qator o‘tkazib yuborildi.` : ''}\n\n${mappingNote}\n\nEndi men shu ma‘lumotlar haqida savollaringizga javob bera olaman.`
      await pushAi(summary)
    } catch {
      await pushAi('Faylni o‘qib bo‘lmadi. Format buzilgan bo‘lishi mumkin.')
    } finally {
      setImporting(false)
    }
  }

  const openEdit = async (msg: Msg) => {
    if (!msg.transactionId) return
    const tx = await fetchTransactionById(msg.transactionId)
    if (!tx) return
    setEditingId(msg.transactionId)
    setEditAmount(String(tx.amount))
    setEditCategory(tx.category)
  }

  const saveEdit = async () => {
    if (!editingId) return
    const amount = Number(editAmount)
    if (isNaN(amount) || amount <= 0) {
      showToast('Summa noto‘g‘ri', 'error')
      return
    }
    const { error } = await updateTransaction(editingId, { amount, category: editCategory })
    if (error) {
      showToast('Xatolik yuz berdi', 'error')
      return
    }
    showToast('Tranzaksiya yangilandi')
    setEditingId(null)
  }

  const removeTransaction = async (msg: Msg) => {
    if (!msg.transactionId || !msg.id) return
    const { error } = await deleteTransaction(msg.transactionId)
    if (error) {
      showToast('Xatolik yuz berdi', 'error')
      return
    }
    setMessages((m) => m.map((mm) => (mm.id === msg.id ? { ...mm, deleted: true, transactionId: null } : mm)))
    showToast('Tranzaksiya o‘chirildi')
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
        {historyLoaded && messages.length === 0 && (
          <p className="text-[13px]" style={{ color: 'var(--text-tertiary)' }}>
            Biznesingiz haqida savol bering, pastdagi takliflardan birini tanlang, yoki Excel/CSV faylni to‘g‘ridan-to‘g‘ri shu yerga biriktiring.
          </p>
        )}
        {messages.map((m, i) => (
          <div key={m.id ?? i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div
              className="max-w-[90%] rounded-lg px-3.5 py-2.5 text-[13px] leading-relaxed"
              style={
                m.role === 'user'
                  ? { backgroundColor: 'var(--accent)', color: 'white', whiteSpace: 'pre-wrap' }
                  : {
                      backgroundColor: 'var(--bg-elevated)',
                      color: m.deleted ? 'var(--text-tertiary)' : 'var(--text-primary)',
                      border: '1px solid var(--border)',
                      textDecoration: m.deleted ? 'line-through' : 'none',
                    }
              }
            >
              {m.role === 'ai' ? (
                <div className="ai-markdown">
                  <ReactMarkdown>{m.deleted ? `${m.text} (o‘chirildi)` : m.text}</ReactMarkdown>
                </div>
              ) : (
                m.text
              )}
            </div>
            {m.transactionId && !m.deleted && editingId !== m.transactionId && (
              <div className="mt-1.5 flex gap-3 px-1">
                <button onClick={() => openEdit(m)} className="text-[11.5px] font-medium" style={{ color: 'var(--accent)' }}>
                  Tahrirlash
                </button>
                <button onClick={() => removeTransaction(m)} className="text-[11.5px] font-medium" style={{ color: 'var(--danger)' }}>
                  O‘chirish
                </button>
              </div>
            )}
            {m.transactionId && editingId === m.transactionId && (
              <div className="mt-2 flex w-full max-w-[90%] flex-col gap-2 rounded-lg border p-3" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-elevated)' }}>
                <div className="flex gap-2">
                  <input
                    value={editAmount}
                    onChange={(e) => setEditAmount(e.target.value)}
                    placeholder="Summa"
                    className="w-28 rounded-md border px-2 py-1.5 text-[12.5px] outline-none"
                    style={{ borderColor: 'var(--border-strong)', backgroundColor: 'var(--surface)', color: 'var(--text-primary)' }}
                  />
                  <input
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    placeholder="Kategoriya"
                    className="flex-1 rounded-md border px-2 py-1.5 text-[12.5px] outline-none"
                    style={{ borderColor: 'var(--border-strong)', backgroundColor: 'var(--surface)', color: 'var(--text-primary)' }}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button onClick={() => setEditingId(null)} className="rounded-md border px-3 py-1 text-[12px]" style={{ borderColor: 'var(--border-strong)', color: 'var(--text-secondary)' }}>
                    Bekor qilish
                  </button>
                  <button onClick={saveEdit} className="rounded-md px-3 py-1 text-[12px] font-semibold text-white" style={{ backgroundColor: 'var(--accent)' }}>
                    Saqlash
                  </button>
                </div>
              </div>
            )}
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
