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
