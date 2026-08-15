import Papa from 'papaparse'

export interface ParsedFile {
  headers: string[]
  rows: Record<string, string>[]
}

export async function parseFile(file: File): Promise<ParsedFile> {
  const ext = '.' + file.name.split('.').pop()?.toLowerCase()

  if (ext === '.csv') {
    const text = await file.text()
    const result = Papa.parse<Record<string, string>>(text, { header: true, skipEmptyLines: true })
    const headers = result.meta.fields ?? []
    return { headers, rows: result.data }
  }

  // .xlsx
  const { default: ExcelJS } = await import('exceljs')
  const buffer = await file.arrayBuffer()
  const workbook = new ExcelJS.Workbook()
  await workbook.xlsx.load(buffer)
  const sheet = workbook.worksheets[0]
  if (!sheet) return { headers: [], rows: [] }

  const headers: string[] = []
  const rows: Record<string, string>[] = []

  sheet.eachRow((row, rowNumber) => {
    const values = Array.isArray(row.values) ? row.values : []
    if (rowNumber === 1) {
      for (let i = 1; i < values.length; i++) {
        headers.push(String(values[i] ?? '').trim())
      }
      return
    }
    const entry: Record<string, string> = {}
    for (let i = 1; i < values.length; i++) {
      const header = headers[i - 1]
      if (!header) continue
      const cell = values[i]
      entry[header] = cell === null || cell === undefined ? '' : String(cell).trim()
    }
    rows.push(entry)
  })

  return { headers, rows }
}

// Ustun nomlariga qarab eng mos ustunni topishga urinadi
const KEYWORDS: Record<string, string[]> = {
  date: ['sana', 'date', 'дата'],
  description: ['tavsif', 'description', 'izoh', 'nomi', 'name', 'наименование'],
  category: ['kategoriya', 'category', 'категория'],
  type: ['tur', 'type', 'турi', 'turi', 'тип'],
  amount: ['summa', 'amount', 'miqdor', 'сумма', 'narx'],
}

export function guessColumn(headers: string[], field: keyof typeof KEYWORDS): string | null {
  const keywords = KEYWORDS[field]
  const lower = headers.map((h) => h.toLowerCase())
  for (const kw of keywords) {
    const idx = lower.findIndex((h) => h.includes(kw))
    if (idx !== -1) return headers[idx]
  }
  return null
}
