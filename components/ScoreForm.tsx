'use client'

import { useState } from 'react'
import { CHARITIES } from '@/lib/utils'

interface ScoreFormProps {
  onAddScore: (score: number, playedAt: string) => Promise<void>
  selectedCharity: string
  onCharityChange: (charityId: string) => Promise<void>
}

export default function ScoreForm({
  onAddScore,
  selectedCharity,
  onCharityChange,
}: ScoreFormProps) {
  const [score, setScore] = useState('')
  const [playedAt, setPlayedAt] = useState(new Date().toISOString().split('T')[0])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const scoreNum = parseInt(score, 10)
    if (!Number.isInteger(scoreNum) || scoreNum < 1 || scoreNum > 45) {
      setError('Score must be a whole number between 1 and 45')
      return
    }

    if (!playedAt) {
      setError('Please select the date you played')
      return
    }

    setLoading(true)
    try {
      await onAddScore(scoreNum, playedAt)
      setScore('')
      setPlayedAt(new Date().toISOString().split('T')[0])
    } catch {
      setError('Failed to add score')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Add Score</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="score" className="block text-gray-700 font-semibold mb-2">
            Score (1-45)
          </label>
          <input
            id="score"
            type="number"
            min="1"
            max="45"
            value={score}
            onChange={(e) => setScore(e.target.value)}
            placeholder="Enter score"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label htmlFor="playedAt" className="block text-gray-700 font-semibold mb-2">
            Date Played
          </label>
          <input
            id="playedAt"
            type="date"
            value={playedAt}
            max={new Date().toISOString().split('T')[0]}
            onChange={(e) => setPlayedAt(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label htmlFor="charity" className="block text-gray-700 font-semibold mb-2">
            Support Charity
          </label>
          <select
            id="charity"
            value={selectedCharity}
            onChange={(e) => onCharityChange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {CHARITIES.map((charity) => (
              <option key={charity.id} value={charity.id}>
                {charity.name}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading ? 'Adding score...' : 'Add Score'}
        </button>
      </form>
    </div>
  )
}