import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const authHeader = req.headers.authorization || ''
  const token = authHeader.replace('Bearer ', '')

  if (!token) {
    res.status(401).json({ error: 'Kirish talab qilinadi' })
    return
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY
  const geminiKey = process.env.GEMINI_API_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    res.status(500).json({ error: 'Server sozlanmagan (Supabase)' })
    return
  }
  if (!geminiKey) {
    res.status(500).json({ error: 'AI kaliti hali sozlanmagan' })
    return
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  })

  const { data: userData, error: userError } = await supabase.auth.getUser(token)
  if (userError || !userData?.user) {
    res.status(401).json({ error: 'Sessiya yaroqsiz, qaytadan kiring' })
    return
  }

  const { data: membership } = await supabase
    .from('business_members')
    .select('business_id')
    .eq('user_id', userData.user.id)
    .limit(1)
    .maybeSingle()

  if (!membership) {
    res.status(404).json({ error: 'Biznes topilmadi' })
    return
  }

  const { data: transactionRows } = await supabase
    .from('transactions')
    .select('*')
    .eq('business_id', membership.business_id)

  const rows = transactionRows || []
  const revenue = rows.filter((t) => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0)
  const expenses = rows.filter((t) => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0)
  const profit = revenue - expenses
  const margin = revenue > 0 ? (profit / revenue) * 100 : 0

  const categoryTotals = {}
  for (const t of rows) {
    if (t.type !== 'expense') continue
    categoryTotals[t.category] = (categoryTotals[t.category] || 0) + Number(t.amount)
  }
  const topCategories = Object.entries(categoryTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([category, total]) => `${category}: ${Math.round(total).toLocaleString('en-US')} UZS`)

  const context =
    rows.length === 0
      ? 'Bu biznes uchun hali hech qanday moliyaviy ma‘lumot yuklanmagan.'
      : `Jami daromad: ${Math.round(revenue).toLocaleString('en-US')} UZS
Jami xarajat: ${Math.round(expenses).toLocaleString('en-US')} UZS
Foyda: ${Math.round(profit).toLocaleString('en-US')} UZS
Foyda marjasi: ${margin.toFixed(1)}%
Tranzaksiyalar soni: ${rows.length}
Eng katta xarajat toifalari: ${topCategories.join(', ') || 'mavjud emas'}`

  const { question, history } = req.body || {}
  if (!question || typeof question !== 'string') {
    res.status(400).json({ error: 'Savol kiritilmagan' })
    return
  }

  const priorMessages = Array.isArray(history)
    ? history
        .filter((m) => m && typeof m.text === 'string' && (m.role === 'user' || m.role === 'ai'))
        .slice(-10)
        .map((m) => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.text }))
    : []

  const systemPrompt = `Siz Hisobfy — biznes uchun moliyaviy tahlilchi AI'siz. Faqat quyida berilgan haqiqiy moliyaviy ma'lumotlar asosida javob bering. Hech qachon raqam yoki tranzaksiya o'ylab topmang. Agar savolga javob berish uchun ma'lumot yetarli bo'lmasa, buni ochiq ayting. Suhbat davomida oldingi savol-javoblarni hisobga oling. Javobingizni O'zbek tilida, qisqa va aniq bering.

Biznesning moliyaviy ma'lumotlari:
${context}`

  try {
    const aiResponse = await fetch('https://generativelanguage.googleapis.com/v1beta/openai/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${geminiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gemini-2.5-flash',
        messages: [{ role: 'system', content: systemPrompt }, ...priorMessages, { role: 'user', content: question }],
        temperature: 0.3,
        max_tokens: 600,
      }),
    })

    if (!aiResponse.ok) {
      const errText = await aiResponse.text()
      console.error('Gemini API error:', errText)
      res.status(502).json({ error: 'AI xizmatidan javob olishda xatolik' })
      return
    }

    const data = await aiResponse.json()
    const answer = data?.choices?.[0]?.message?.content ?? 'Javob topilmadi.'
    res.status(200).json({ answer })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Kutilmagan xatolik yuz berdi' })
  }
}
