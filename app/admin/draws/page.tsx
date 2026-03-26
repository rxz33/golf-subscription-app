'use client'

import { useEffect, useState } from 'react'
import type { Draw } from '@/lib/types'

export default function AdminDraws() {
  const [draws, setDraws] = useState<Draw[]>([])
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear] = useState(now.getFullYear())

  useEffect(() => {
    fetch('/api/admin/draws', { credentials: 'include' })
      .then(r => r.json())
      .then(d => setDraws(d.draws ?? []))
  }, [])

  const runDraw = async (publish: boolean) => {
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch('/api/admin/draws', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ month, year, publish }),
      })
      const data = await res.json()
      setResult(data)
      if (data.draw) {
        setDraws(prev => {
          const exists = prev.find(d => d.id === data.draw.id)
          return exists ? prev.map(d => d.id === data.draw.id ? data.draw : d) : [data.draw, ...prev]
        })
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-black text-slate-900 mb-8">Draw Management</h1>

      {/* Draw controls */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-8">
        <h2 className="font-bold text-slate-800 mb-4">Run a Draw</h2>
        <div className="flex gap-4 mb-6 flex-wrap">
          <div>
            <label className="text-sm text-slate-500 block mb-1">Month</label>
            <select
              value={month}
              onChange={e => setMonth(Number(e.target.value))}
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm"
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {new Date(2000, i).toLocaleString('default', { month: 'long' })}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm text-slate-500 block mb-1">Year</label>
            <input
              type="number"
              value={year}
              onChange={e => setYear(Number(e.target.value))}
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm w-24"
            />
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => runDraw(false)}
            disabled={loading}
            className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold px-4 py-2 rounded-lg text-sm transition disabled:opacity-50"
          >
            {loading ? 'Running...' : '🔍 Simulate'}
          </button>
          <button
            onClick={() => runDraw(true)}
            disabled={loading}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2 rounded-lg text-sm transition disabled:opacity-50"
          >
            {loading ? 'Publishing...' : '🚀 Run & Publish'}
          </button>
        </div>

        {result && (
          <div className="mt-6 bg-slate-50 rounded-lg p-4 text-sm">
            <p className="font-bold text-slate-800 mb-2">
              Winning numbers: {result.simulation.winning_numbers.join(', ')}
            </p>
            <p className="text-slate-600">Total pool: ${result.simulation.total_pool.toFixed(2)}</p>
            <p className="text-slate-600">5-match winners: {result.simulation.winners['5-match']}</p>
            <p className="text-slate-600">4-match winners: {result.simulation.winners['4-match']}</p>
            <p className="text-slate-600">3-match winners: {result.simulation.winners['3-match']}</p>
            {result.simulation.jackpot_rolled_over && (
              <p className="text-amber-600 font-semibold mt-1">🔁 No 5-match winner — jackpot rolls over!</p>
            )}
          </div>
        )}
      </div>

      {/* Draws list */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {['Month/Year', 'Status', 'Winning Numbers', 'Prize Pool', 'Jackpot Rolled'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-slate-500 font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {draws.map(draw => (
              <tr key={draw.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium">{new Date(draw.year, draw.month - 1).toLocaleString('default', { month: 'long' })} {draw.year}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                    draw.status === 'published' ? 'bg-emerald-100 text-emerald-700' :
                    draw.status === 'simulated' ? 'bg-blue-100 text-blue-700' :
                    'bg-slate-100 text-slate-600'
                  }`}>{draw.status}</span>
                </td>
                <td className="px-4 py-3 font-mono">{draw.winning_numbers.join(', ')}</td>
                <td className="px-4 py-3">${draw.total_prize_pool.toFixed(2)}</td>
                <td className="px-4 py-3">{draw.jackpot_rolled_over ? '🔁 Yes' : '—'}</td>
              </tr>
            ))}
            {draws.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400">No draws yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}