'use client'

import { useEffect, useState } from 'react'

interface CharityRow {
  id: string
  name: string
  description: string
  is_featured: boolean
}

export default function AdminCharities() {
  const [charities, setCharities] = useState<CharityRow[]>([])
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/admin/charities', { credentials: 'include' })
      .then(r => r.json())
      .then(d => setCharities(d.charities ?? []))
  }, [])

  const toggleFeatured = async (id: string, current: boolean) => {
    setUpdating(id)

    await fetch(`/api/admin/charities/${id}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_featured: !current }),
    })

    setCharities(prev =>
      prev.map(c =>
        c.id === id ? { ...c, is_featured: !current } : c
      )
    )

    setUpdating(null)
  }

  return (
    <div>
      <h1 className="text-2xl font-black text-slate-900 mb-8">Charities</h1>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {['Name', 'Description', 'Featured', 'Actions'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-slate-500 font-semibold">{h}</th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {charities.map(c => (
              <tr key={c.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-semibold">{c.name}</td>

                <td className="px-4 py-3 text-slate-600">
                  {c.description}
                </td>

                <td className="px-4 py-3">
                  {c.is_featured ? '⭐ Featured' : '—'}
                </td>

                <td className="px-4 py-3">
                  <button
                    onClick={() => toggleFeatured(c.id, c.is_featured)}
                    disabled={updating === c.id}
                    className="text-xs bg-indigo-100 text-indigo-700 hover:bg-indigo-200 px-2 py-1 rounded font-semibold transition"
                  >
                    {c.is_featured ? 'Unfeature' : 'Feature'}
                  </button>
                </td>
              </tr>
            ))}

            {charities.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-slate-400">
                  No charities found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}