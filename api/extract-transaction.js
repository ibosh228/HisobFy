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

  if (!supabaseUrl || !supabaseAnonKey || !geminiKey) {
    res.status(500).json({ error: 'Server sozlanmagan' })
    return
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  })

  const { data: userData, error: userError } = await supabase.auth.getUser(token)
  if (userError || !userData?.user) {
    res.status(401).json({ error: 'Sessiya yaroqsiz' })
    return
  }

  const { message } = req.body || {}
  if (!message || typeof message !== 'string') {
    res.status(400).json({ error: 'Xabar yuborilmadi' })
    return
  }

  const today = new Date().toISOString().slice(0, 10)

  const prompt = `Foydalanuvchi xabarini tahlil qil. Bugungi sana: ${today}.

Agar bu xabar bitta aniq moliyaviy tranzaksiya (xarajat yoki daromad) haqida bo'lsa (masalan: "bugun 50000 taksiga ketdi", "200000 sotuvdan tushdi", "500 ming marketingga sarfladim"), quyidagi JSON formatida javob ber:
{"isTransaction": true, "date": "YYYY-MM-DD", "description": "<qisqa tavsif>", "category": "<mos toifa>", "type": "income" yoki "expense", "amount": <faqat son, valyutasiz>}

Agar xabar tranzaksiya bo'lmasa (oddiy savol, salomlashish yoki umumiy gap bo'lsa), faqat shuni qaytar:
{"isTransaction": false}

Aniq sana ko'rsatilmagan bo'lsa, bugungi sanani ishlat. Faqat JSON qaytar, boshqa hech narsa yozma.

Xabar: "${message}"`

  try {
    const aiResponse = await fetch('https://generativelanguage.googleapis.com/v1beta/openai/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${geminiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gemini-3.5-flash-lite',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0,
        max_tokens: 200,
        response_format: { type: 'json_object' },
      }),
    })

    if (!aiResponse.ok) {
      res.status(200).json({ isTransaction: false })
      return
    }

    const data = await aiResponse.json()
    const raw = data?.choices?.[0]?.message?.content ?? '{"isTransaction": false}'

    let result
    try {
      result = JSON.parse(raw)
    } catch {
      res.status(200).json({ isTransaction: false })
      return
    }

    if (!result.isTransaction || typeof result.amount !== 'number' || result.amount <= 0 || !result.description) {
      res.status(200).json({ isTransaction: false })
      return
    }

    res.status(200).json({
      isTransaction: true,
      date: result.date || today,
      description: String(result.description),
      category: result.category ? String(result.category) : 'Boshqa',
      type: result.type === 'income' ? 'income' : 'expense',
      amount: Math.abs(Number(result.amount)),
    })
  } catch (err) {
    console.error(err)
    res.status(200).json({ isTransaction: false })
  }
}
