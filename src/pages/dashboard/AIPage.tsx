import { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'

type Msg = { role: 'user' | 'ai'; text: string }

const suggested = [
  'Foyda qanday?',
  'Eng katta xarajat qaysi toifada?',
  'Daromadni qanday oshirsam bo‘ladi?',
  'Xarajatlarni qisqartirish uchun nima qilsam bo‘ladi?',
]

export default function AIPage() {
  const [messages, setMessages] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const ask = async (question: string) => {
    if (!question.trim() || loading) return
    const newHistory = [...messages, { role: 'user' as const, text: question }]
    setMessages(newHistory)
    setInput('')
    setLoading(true)

    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData.session?.access_token

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
            Biznesingiz haqida savol bering yoki pastdagi takliflardan birini tanlang.
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
        {loading && (
          <div className="flex justify-start">
            <div className="rounded-lg border px-3.5 py-2.5 text-[13px]" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-elevated)', color: 'var(--text-tertiary)' }}>
              Hisobfy tahlil qilmoqda…
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
              disabled={loading}
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
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Savolingizni yozing…"
          className="flex-1 rounded-lg border px-3.5 py-2.5 text-[13px] outline-none"
          style={{ borderColor: 'var(--border-strong)', backgroundColor: 'var(--surface)', color: 'var(--text-primary)' }}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="rounded-lg px-4 py-2.5 text-[13px] font-semibold text-white disabled:opacity-50"
          style={{ backgroundColor: 'var(--accent)' }}
        >
          Yuborish
        </button>
      </form>
    </div>
  )
}
