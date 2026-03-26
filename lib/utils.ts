export const CHARITIES = [
  { id: '1', name: 'World Wildlife Fund' },
  { id: '2', name: 'The Nature Conservancy' },
  { id: '3', name: 'Conservation International' },
] as const

export const VALID_CHARITY_IDS = CHARITIES.map(c => c.id)

export const PLANS = {
  MONTHLY: 'monthly',
  YEARLY: 'yearly',
} as const

export const PLAN_PRICES = {
  monthly: 9.99,
  yearly: 99.99,
} as const

export const PRIZE_POOL_SPLIT = {
  '5-match': 0.40,
  '4-match': 0.35,
  '3-match': 0.25,
} as const

export const formatDate = (date: string): string => {
  const parsed = new Date(date)
  if (isNaN(parsed.getTime())) return '—'
  return parsed.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)

// Simplified handicap estimate — display purposes only
export const calculateHandicap = (scores: number[]): number => {
  if (scores.length === 0) return 0
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length
  return Math.round((avg - 72) * 0.96)
}

export const calculatePrizePool = (activeSubscribers: number, plan: 'monthly' | 'yearly'): number => {
  const monthlyRevenue = plan === 'yearly'
    ? (PLAN_PRICES.yearly / 12) * activeSubscribers
    : PLAN_PRICES.monthly * activeSubscribers
  return parseFloat((monthlyRevenue * 0.6).toFixed(2)) // 60% goes to prize pool
}