import { supabase } from './supabaseClient'

export interface Business {
  id: string
  name: string
  owner_id: string
}

export interface Transaction {
  id: string
  business_id: string
  date: string
  description: string
  category: string
  type: 'income' | 'expense'
  amount: number
  currency: string
}

// Foydalanuvchining biznesini topadi, agar bo'lmasa yangisini yaratadi
export async function ensureBusiness(userId: string): Promise<Business | null> {
  const { data: membership } = await supabase
    .from('business_members')
    .select('business_id')
    .eq('user_id', userId)
    .limit(1)
    .maybeSingle()

  if (membership) {
    const { data: business } = await supabase.from('businesses').select('*').eq('id', membership.business_id).single()
    return business ?? null
  }

  const { data: newBusiness, error: businessError } = await supabase
    .from('businesses')
    .insert({ owner_id: userId })
    .select()
    .single()

  if (businessError || !newBusiness) return null

  await supabase.from('business_members').insert({ business_id: newBusiness.id, user_id: userId, role: 'owner' })

  return newBusiness
}

export async function fetchTransactions(businessId: string): Promise<Transaction[]> {
  const { data } = await supabase
    .from('transactions')
    .select('*')
    .eq('business_id', businessId)
    .order('date', { ascending: true })

  return data ?? []
}

export interface FinancialMetrics {
  revenue: number
  expenses: number
  profit: number
  margin: number
}

export function computeMetrics(transactions: Transaction[]): FinancialMetrics {
  const revenue = transactions.filter((t) => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0)
  const expenses = transactions.filter((t) => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0)
  const profit = revenue - expenses
  const margin = revenue > 0 ? (profit / revenue) * 100 : 0
  return { revenue, expenses, profit, margin }
}

export interface ColumnMapping {
  date: string
  description: string
  category: string
  amount: string
  typeMode: 'column' | 'sign'
  typeColumn?: string
  incomeValue?: string
}

export interface ImportResult {
  validCount: number
  invalidCount: number
  inserted: boolean
  error?: string
}

function normalizeDate(raw: string): string | null {
  const s = raw.trim()
  if (!s) return null

  // YYYY-MM-DD yoki YYYY/MM/DD
  let m = s.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/)
  if (m) return `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}`

  // DD.MM.YYYY yoki DD/MM/YYYY
  m = s.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/)
  if (m) return `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`

  const parsed = Date.parse(s)
  if (!isNaN(parsed)) return new Date(parsed).toISOString().slice(0, 10)

  return null
}

function normalizeAmount(raw: string): number | null {
  let s = raw.trim().replace(/\s/g, '').replace(/,/g, '')
  if (!s) return null
  const n = parseFloat(s)
  if (isNaN(n)) return null
  return n
}

export function buildTransactionsFromRows(
  rows: Record<string, string>[],
  mapping: ColumnMapping
): { valid: Omit<Transaction, 'id' | 'business_id'>[]; invalidCount: number } {
  const valid: Omit<Transaction, 'id' | 'business_id'>[] = []
  let invalidCount = 0

  for (const row of rows) {
    const date = normalizeDate(row[mapping.date] ?? '')
    const description = (row[mapping.description] ?? '').trim()
    const category = (row[mapping.category] ?? '').trim() || 'Boshqa'
    const amountRaw = normalizeAmount(row[mapping.amount] ?? '')

    if (!date || !description || amountRaw === null) {
      invalidCount++
      continue
    }

    let type: 'income' | 'expense'
    let amount = amountRaw

    if (mapping.typeMode === 'sign') {
      type = amountRaw >= 0 ? 'income' : 'expense'
      amount = Math.abs(amountRaw)
    } else {
      const typeValue = (row[mapping.typeColumn ?? ''] ?? '').trim()
      type = typeValue === mapping.incomeValue ? 'income' : 'expense'
      amount = Math.abs(amountRaw)
    }

    valid.push({ date, description, category, type, amount, currency: 'UZS' })
  }

  return { valid, invalidCount }
}

export async function insertTransactions(businessId: string, transactions: Omit<Transaction, 'id' | 'business_id'>[]) {
  const rows = transactions.map((t) => ({ ...t, business_id: businessId }))
  const { error } = await supabase.from('transactions').insert(rows)
  return { error }
}

export interface MonthlySeries {
  labels: string[]
  daromad: number[]
  xarajat: number[]
  foyda: number[]
}

const MONTH_NAMES = ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyun', 'Iyul', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek']

export function groupByMonth(transactions: Transaction[]): MonthlySeries {
  const buckets = new Map<string, { daromad: number; xarajat: number }>()

  for (const t of transactions) {
    const d = new Date(t.date)
    if (isNaN(d.getTime())) continue
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const bucket = buckets.get(key) ?? { daromad: 0, xarajat: 0 }
    if (t.type === 'income') bucket.daromad += Number(t.amount)
    else bucket.xarajat += Number(t.amount)
    buckets.set(key, bucket)
  }

  const sortedKeys = Array.from(buckets.keys()).sort()
  const labels = sortedKeys.map((k) => {
    const [, m] = k.split('-')
    return MONTH_NAMES[parseInt(m, 10) - 1]
  })
  const daromad = sortedKeys.map((k) => buckets.get(k)!.daromad)
  const xarajat = sortedKeys.map((k) => buckets.get(k)!.xarajat)
  const foyda = daromad.map((d, i) => d - xarajat[i])

  return { labels, daromad, xarajat, foyda }
}

export interface CategoryTotal {
  category: string
  total: number
  share: number
}

export function groupByCategory(transactions: Transaction[], type: 'income' | 'expense'): CategoryTotal[] {
  const filtered = transactions.filter((t) => t.type === type)
  const total = filtered.reduce((sum, t) => sum + Number(t.amount), 0)
  const map = new Map<string, number>()

  for (const t of filtered) {
    map.set(t.category, (map.get(t.category) ?? 0) + Number(t.amount))
  }

  return Array.from(map.entries())
    .map(([category, amount]) => ({ category, total: amount, share: total > 0 ? (amount / total) * 100 : 0 }))
    .sort((a, b) => b.total - a.total)
}

export async function deleteAllTransactions(businessId: string) {
  const { error } = await supabase.from('transactions').delete().eq('business_id', businessId)
  return { error }
}

export async function deleteTransaction(id: string) {
  const { error } = await supabase.from('transactions').delete().eq('id', id)
  return { error }
}

export async function countTransactions(businessId: string): Promise<number> {
  const { count } = await supabase.from('transactions').select('*', { count: 'exact', head: true }).eq('business_id', businessId)
  return count ?? 0
}
