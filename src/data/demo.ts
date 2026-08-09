export const metrics = [
  { key: 'daromad', label: 'Daromad', value: '82,450,000', unit: 'UZS', change: '12.4%', up: true },
  { key: 'xarajat', label: 'Xarajatlar', value: '64,200,000', unit: 'UZS', change: '21.7%', up: true },
  { key: 'foyda', label: 'Foyda', value: '18,250,000', unit: 'UZS', change: '8.2%', up: false },
  { key: 'marja', label: 'Foyda marjasi', value: '22.1', unit: '%', change: '3.4%', up: false },
]

export const timeRanges = ['7 kun', '30 kun', '3 oy', '6 oy', '1 yil']

export const months = ['Mar', 'Apr', 'May', 'Iyun', 'Iyul', 'Avg']
export const seriesByRange: Record<string, { daromad: number[]; xarajat: number[]; foyda: number[]; labels: string[] }> = {
  '7 kun': { labels: ['Se', 'Ya', 'Se', 'Ch', 'Pa', 'Ju', 'Sh'], daromad: [60, 64, 58, 70, 74, 80, 88], xarajat: [40, 44, 46, 50, 52, 58, 62], foyda: [20, 20, 12, 20, 22, 22, 26] },
  '30 kun': { labels: months, daromad: [40, 52, 58, 66, 74, 88], xarajat: [30, 34, 36, 42, 46, 62], foyda: [10, 18, 22, 24, 28, 26] },
  '3 oy': { labels: months, daromad: [45, 55, 60, 68, 76, 88], xarajat: [32, 36, 39, 44, 50, 62], foyda: [13, 19, 21, 24, 26, 26] },
  '6 oy': { labels: months, daromad: [40, 52, 58, 66, 74, 88], xarajat: [30, 34, 36, 42, 46, 62], foyda: [10, 18, 22, 24, 28, 26] },
  '1 yil': { labels: months, daromad: [35, 48, 55, 64, 72, 88], xarajat: [28, 32, 35, 40, 47, 62], foyda: [7, 16, 20, 24, 25, 26] },
}

export const aiInsights = [
  {
    id: 'foyda',
    title: 'Foyda kamaydi',
    lines: ['Foyda o‘tgan oyga nisbatan 8.2% ga kamaydi.', 'Xarajatlar 21.7% ga oshgan.'],
    tone: 'danger' as const,
  },
  {
    id: 'marketing',
    title: 'Marketing xarajatlari oshdi',
    lines: ['Marketing xarajatlari 41% ga oshgan, savdo esa 6% ga oshgan.'],
    tone: 'warning' as const,
  },
  {
    id: 'daromad',
    title: 'Daromad o‘smoqda',
    lines: ['Daromad o‘tgan oyga nisbatan 12.4% ga oshgan.'],
    tone: 'success' as const,
  },
]

export const transactions = [
  { date: '01.08.2026', desc: 'ABC Supplier', category: 'Yetkazib beruvchi', type: 'Xarajat', amount: '4,250,000 UZS' },
  { date: '03.08.2026', desc: 'Online Sales', category: 'Sotuv', type: 'Daromad', amount: '7,800,000 UZS' },
  { date: '05.08.2026', desc: 'Marketing', category: 'Reklama', type: 'Xarajat', amount: '1,200,000 UZS' },
  { date: '07.08.2026', desc: 'Wholesale Order', category: 'Sotuv', type: 'Daromad', amount: '12,400,000 UZS' },
  { date: '09.08.2026', desc: 'Office Rent', category: 'Ijara', type: 'Xarajat', amount: '3,000,000 UZS' },
  { date: '12.08.2026', desc: 'Consulting Fee', category: 'Xizmat', type: 'Daromad', amount: '2,600,000 UZS' },
  { date: '15.08.2026', desc: 'Logistics Co.', category: 'Yetkazib beruvchi', type: 'Xarajat', amount: '2,150,000 UZS' },
  { date: '18.08.2026', desc: 'Retail Sales', category: 'Sotuv', type: 'Daromad', amount: '5,900,000 UZS' },
]

export const uploadedFiles = [
  { name: 'August_finance.xlsx', status: 'Qayta ishlangan' },
  { name: 'July_finance.xlsx', status: 'Qayta ishlangan' },
]
