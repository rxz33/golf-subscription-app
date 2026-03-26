'use client'

import { useEffect, useState } from 'react'
import { formatCurrency } from '@/lib/utils'

interface Stats {
  total_users: number
  active_subscribers: number
  total_prize_pool: number
  total_draws: number
}

export default function AdminOverview() {
  const [stats, setStats] = useState<Stats | null>(null)

  useEffect(() => {
    fetch('/api/admin/stats', { credentials: 'include' })
      .then(r => r.json())
      .then(d => setStats(d.stats))
      .catch(console.error)
  }, [])

  const cards = stats ? [
    { label: 'Total Users', value: stats.total_users },
    { label: 'Active Subscribers', value: stats.active_subscribers },
    { label: 'Est. Prize Pool', value: formatCurrency(stats.total_prize_pool) },
    { label: 'Draws Run', value: stats.total_draws },
  ] : []

  return (
    <div>
      <h1 className="text-2xl font-black text-slate-900 mb-8">Overview</h1>
      {!stats ? (
        <p className="text-slate-400 animate-pulse">Loading...</p>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map(({ label, value }) => (
            <div key={label} className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
              <div className="text-sm text-slate-500 mb-1">{label}</div>
              <div className="text-3xl font-black text-slate-900">{value}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}