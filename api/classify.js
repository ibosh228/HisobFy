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

  const { headers, sampleRows } = req.body || {}
  if (!Array.isArray(headers) || headers.length === 0 || !Array.isArray(sampleRows)) {
    res.status(400).json({ error: 'Ustun ma\u2018lumotlari yuborilmadi' })
    return
  }

  const prompt = `Quyida jadval ustun nomlari va bir nechta namuna qatorlar berilgan. Har bir ustunning vazifasini aniqla.

Ustunlar: ${JSON.stringify(headers)}

Namuna qatorlar (JSON):
${JSON.stringify(sampleRows.slice(0, 8))}

Faqat quyidagi JSON formatida javob ber, boshqa hech narsa yozma:
{
  "date": "<sana ustuni nomi, headers ro'yxatidan aynan olingan>",
  "description": "<tavsif ustuni nomi>",
  "category": "<kategoriya ustuni nomi yoki null agar bo'lmasa>",
  "amount": "<summa/miqdor ustuni nomi>",
  "type_column": "<daromad/xarajat turini bildiruvchi ustun nomi, agar mavjud bo'lsa; aks holda null>",
  "income_value": "<type_column ichidagi qaysi aniq qiymat 'daromad'ni bildiradi; type_column null bo'lsa, bu ham null>"
}

Muhim: ustun nomlarini faqat yuqoridagi "Ustunlar" ro'yxatidan aynan tanla, o'zing o'ylab topma. Agar type_column topilmasa, income_value ham null bo'lsin.`

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
        max_tokens: 300,
        response_format: { type: 'json_object' },
      }),
    })

    if (!aiResponse.ok) {
      const errText = await aiResponse.text()
      console.error('Gemini classify error:', errText)
      res.status(502).json({ error: 'AI ustunlarni aniqlay olmadi' })
      return
    }

    const data = await aiResponse.json()
    const raw = data?.choices?.[0]?.message?.content ?? '{}'

    let mapping
    try {
      mapping = JSON.parse(raw)
    } catch {
      res.status(502).json({ error: 'AI javobini o\u2018qib bo\u2018lmadi' })
      return
    }

    if (!mapping.date || !mapping.description || !mapping.amount) {
      res.status(422).json({ error: 'AI zarur ustunlarni aniqlay olmadi' })
      return
    }

    res.status(200).json({ mapping })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Kutilmagan xatolik yuz berdi' })
  }
}
