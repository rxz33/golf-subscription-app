export type { User as AuthUser } from '@supabase/supabase-js'

export interface Profile {
  id: string
  email: string
  full_name: string | null
  is_admin: boolean
  created_at: string
}

export interface Charity {
  id: string
  name: string
  description: string | null
  image_url: string | null
  is_featured: boolean
  created_at: string
}

export interface GolfScore {
  id: string
  user_id: string
  score: number
  charity_id: string | null
  played_at: string
  created_at: string
}

export interface Subscription {
  id: string
  user_id: string
  status: 'active' | 'inactive' | 'cancelled'
  plan: 'monthly' | 'yearly'
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  current_period_end: string | null
  charity_id: string | null
  charity_percentage: number
  updated_at: string
}

export interface Draw {
  id: string
  month: number
  year: number
  status: 'pending' | 'simulated' | 'published'
  winning_numbers: number[]
  jackpot_amount: number
  jackpot_rolled_over: boolean
  total_prize_pool: number
  created_at: string
  published_at: string | null
}

export interface DrawEntry {
  id: string
  draw_id: string
  user_id: string
  numbers: number[]
  match_count: number
  created_at: string
}

export interface Winner {
  id: string
  draw_id: string
  user_id: string
  match_type: '5-match' | '4-match' | '3-match'
  prize_amount: number
  proof_url: string | null
  status: 'pending' | 'verified' | 'paid' | 'rejected'
  created_at: string
}