'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PLAN_PRICES, formatCurrency } from '@/lib/utils'

export default function PricingPage() {
  const [loading, setLoading] = useState<string | null>(null)
  const router = useRouter()

  const handleSubscribe = async (plan: 'monthly' | 'yearly') => {
    setLoading(plan)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      })

      if (res.status === 401) {
        router.push('/auth/login')
        return
      }

      const data = await res.json()
      if (data.url) window.location.href = data.url
    } catch (err) {
      console.error('[Pricing]', err)
    } finally {
      setLoading(null)
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-14">
          <h1 className="text-4xl font-black text-slate-900 mb-4">Choose your plan</h1>
          <p className="text-slate-500">Cancel any time. 10% always goes to your chosen charity.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {(['monthly', 'yearly'] as const).map((plan) => (
            <div
              key={plan}
              className={`bg-white rounded-2xl p-8 border shadow-sm ${
                plan === 'yearly' ? 'border-emerald-400 ring-2 ring-emerald-400' : 'border-slate-200'
              }`}
            >
              {plan === 'yearly' && (
                <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full">
                  Best value — save 17%
                </span>
              )}
              <h2 className="text-2xl font-black text-slate-900 mt-4 capitalize">{plan}</h2>
              <div className="text-4xl font-black text-slate-900 mt-2">
                {formatCurrency(PLAN_PRICES[plan])}
                <span className="text-lg font-normal text-slate-400">
                  /{plan === 'monthly' ? 'mo' : 'yr'}
                </span>
              </div>
              <button
                onClick={() => handleSubscribe(plan)}
                disabled={loading === plan}
                className="w-full mt-8 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition disabled:opacity-50"
              >
                {loading === plan ? 'Redirecting...' : 'Subscribe now'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}