'use client'

import { useEffect, useState } from 'react'

interface WinnerRow {
  id: string
  match_type: string
  prize_amount: number
  status: string
  created_at: string
  profiles: { email: string }
  draws: { month: number; year: number }
}

export default function AdminWinners() {
  const [winners, setWinners] = useState<WinnerRow[]>([])
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/admin/winners', { credentials: 'include' })
      .then(r => r.json())
      .then(d => setWinners(d.winners ?? []))
  }, [])

  const updateStatus = async (id: string, status: string) => {
    setUpdating(id)
    await fetch(`/api/admin/winners/${id}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    setWinners(prev => prev.map(w => w.id === id ? { ...w, status } : w))
    setUpdating(null)
  }

  return (
    <div>
      <h1 className="text-2xl font-black text-slate-900 mb-8">Winners</h1>
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {['User', 'Draw', 'Match', 'Prize', 'Status', 'Actions'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-slate-500 font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {winners.map(w => (
              <tr key={w.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">{w.profiles?.email}</td>
                <td className="px-4 py-3">{new Date(w.draws?.year, w.draws?.month - 1).toLocaleString('default', { month: 'short' })} {w.draws?.year}</td>
                <td className="px-4 py-3 font-semibold">{w.match_type}</td>
                <td className="px-4 py-3">${w.prize_amount.toFixed(2)}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                    w.status === 'paid' ? 'bg-emerald-100 text-emerald-700' :
                    w.status === 'verified' ? 'bg-blue-100 text-blue-700' :
                    w.status === 'rejected' ? 'bg-red-100 text-red-700' :
                    'bg-amber-100 text-amber-700'
                  }`}>{w.status}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    {w.status === 'pending' && (
                      <>
                        <button onClick={() => updateStatus(w.id, 'verified')} disabled={updating === w.id}
                          className="text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 px-2 py-1 rounded font-semibold transition">
                          Verify
                        </button>
                        <button onClick={() => updateStatus(w.id, 'rejected')} disabled={updating === w.id}
                          className="text-xs bg-red-100 text-red-700 hover:bg-red-200 px-2 py-1 rounded font-semibold transition">
                          Reject
                        </button>
                      </>
                    )}
                    {w.status === 'verified' && (
                      <button onClick={() => updateStatus(w.id, 'paid')} disabled={updating === w.id}
                        className="text-xs bg-emerald-100 text-emerald-700 hover:bg-emerald-200 px-2 py-1 rounded font-semibold transition">
                        Mark Paid
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {winners.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400">No winners yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}