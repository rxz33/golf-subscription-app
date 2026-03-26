import { formatDate } from '@/lib/utils'
import { CHARITIES } from '@/lib/utils'
import type { GolfScore } from '@/lib/types'

interface ScoresListProps {
  scores: GolfScore[]
}

export default function ScoresList({ scores }: ScoresListProps) {
  const getCharityName = (charityId: string) => {
    return CHARITIES.find((c) => c.id === charityId)?.name || 'Unknown'
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
                <p className="text-gray-600 text-sm">
                  {formatDate(score.created_at)}
                </p>
                <p className="text-gray-600 text-sm">
                  {getCharityName(score.charity_id ?? 'No charity selected')}
                </p>
              </div>
              <p className="text-3xl font-bold text-blue-600">{score.score}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}