'use client'

import { useEffect, useState } from 'react'

interface UserRow {
  id: string
  email: string
  is_admin: boolean
  subscriptions: {
    status: string
    plan: string
  } | null
}

export default function AdminUsers() {
  const [users, setUsers] = useState<UserRow[]>([])
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/admin/users', { credentials: 'include' })
      .then(r => r.json())
      .then(d => setUsers(d.users ?? []))
  }, [])

  const toggleAdmin = async (id: string, current: boolean) => {
    setUpdating(id)

    await fetch(`/api/admin/users/${id}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_admin: !current }),
    })

    setUsers(prev =>
      prev.map(u =>
        u.id === id ? { ...u, is_admin: !current } : u
      )
    )

    setUpdating(null)
  }

  return (
    <div>
      <h1 className="text-2xl font-black text-slate-900 mb-8">Users</h1>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {['Email', 'Plan', 'Status', 'Admin', 'Actions'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-slate-500 font-semibold">{h}</th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {users.map(u => (
              <tr key={u.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">{u.email}</td>

                <td className="px-4 py-3 capitalize">
                  {u.subscriptions?.plan ?? '—'}
                </td>

                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                    u.subscriptions?.status === 'active'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    {u.subscriptions?.status ?? 'inactive'}
                  </span>
                </td>

                <td className="px-4 py-3">
                  {u.is_admin ? '✅' : '—'}
                </td>

                <td className="px-4 py-3">
                  <button
                    onClick={() => toggleAdmin(u.id, u.is_admin)}
                    disabled={updating === u.id}
                    className="text-xs bg-indigo-100 text-indigo-700 hover:bg-indigo-200 px-2 py-1 rounded font-semibold transition"
                  >
                    {u.is_admin ? 'Remove Admin' : 'Make Admin'}
                  </button>
                </td>
              </tr>
            ))}

            {users.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}