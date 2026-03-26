import { formatDate } from '@/lib/utils'
import { CHARITIES } from '@/lib/utils'
import type { GolfScore } from '@/lib/types'

interface ScoresListProps {
  scores: GolfScore[]
}

export default function ScoresList({ scores }: ScoresListProps) {
  // Handles both old string IDs ("1","2","3") and new uuid charity_id
  const getCharityName = (score: GolfScore): string => {
    const id = (score as any).charity ?? score.charity_id
    if (!id) return 'No charity selected'
    // Try matching against hardcoded list first (old string IDs)
    const match = CHARITIES.find((c) => c.id === id || c.name === id)
    return match?.name ?? 'Unknown'
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Scores</h2>

      {scores.length === 0 ? (
        <p className="text-gray-600 text-center py-8">No scores added yet</p>
      ) : (
        <div className="space-y-4">
          {scores.map((score) => (
            <div
              key={score.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
            >
              <div>
                <p className="text-gray-700 font-medium text-sm">
                  {formatDate((score as any).played_at ?? score.created_at)}
                </p>
                <p className="text-gray-500 text-sm mt-0.5">
                  {getCharityName(score)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-blue-600">{score.score}</p>
                <p className="text-xs text-gray-400">Stableford</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}