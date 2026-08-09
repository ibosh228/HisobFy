import { useState } from 'react'

type Msg = { role: 'user' | 'ai'; text: string }

const canned: Record<string, string> = {
  'Nima yaxshilandi?': 'Daromad o‘tgan oyga nisbatan 12.4% ga oshdi va sotuvlar barqaror o‘sishda davom etmoqda.',
  'Qaysi xarajatlar eng ko‘p oshdi?': 'Marketing xarajatlari 41% ga oshdi — bu eng katta o‘sish ko‘rsatilgan kategoriya.',
  'Daromad nega o‘zgardi?': 'Daromad asosan sotuv hajmining oshishi va yangi buyurtmalar hisobiga 12.4% ga o‘sdi.',
  'Qayerda tejash mumkin?': 'Marketing va yetkazib beruvchilar xarajatlarini qayta ko‘rib chiqish eng katta tejash imkoniyatini beradi.',
}

const suggested = Object.keys(canned)

export default function AIPage() {
  const [messages, setMessages] = useState<Msg[]>([
    { role: 'user', text: 'Nega foydamiz kamaydi?' },
    { role: 'ai', text: 'Foyda o‘tgan oyga nisbatan 8.2% ga kamaygan. Asosiy sabab xarajatlarning 21.7% ga oshgani.' },
  ])

  const ask = (q: string) => {
    setMessages((m) => [...m, { role: 'user', text: q }, { role: 'ai', text: canned[q] ?? 'Bu savol bo‘yicha tahlil hozircha demo rejimida mavjud emas.' }])
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
        Demo suhbat — hozircha real AI ulanmagan
      </div>

      <div className="flex flex-col gap-3 rounded-xl border p-5" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}>
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className="max-w-[85%] rounded-lg px-3.5 py-2.5 text-[13px] leading-relaxed"
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
              className="rounded-full border px-3.5 py-1.5 text-[12.5px] transition-colors duration-150"
              style={{ borderColor: 'var(--border-strong)', color: 'var(--text-secondary)' }}
            >
              {q}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
