'use client'

import { useRouter } from 'next/navigation'
import { formatDate } from '@/lib/utils'

interface SubscriptionStatusProps {
  status: string
  onToggle: () => Promise<void>
  currentPeriodEnd?: string | null
  plan?: string | null
}

export default function SubscriptionStatus({
  status,
  onToggle,
  currentPeriodEnd,
  plan,
}: SubscriptionStatusProps) {
  const isActive = status === 'active'
  const router = useRouter()

  const handleClick = () => {
    if (!isActive) {
      router.push('/pricing')
    } else {
      onToggle()
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Subscription</h2>

      <div className={`p-4 rounded-lg mb-4 ${
        isActive
          ? 'bg-green-50 border border-green-200'
          : 'bg-gray-50 border border-gray-200'
      }`}>
        <p className="text-sm text-gray-500 mb-1">Status</p>
        <p className={`text-2xl font-bold ${isActive ? 'text-green-600' : 'text-gray-500'}`}>
          {isActive ? '✓ Active' : '✗ Inactive'}
        </p>
      </div>

      {isActive && plan && (
        <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 mb-4 text-sm">
          <span className="text-blue-600 font-semibold capitalize">{plan} plan</span>
          {currentPeriodEnd && (
            <span className="text-gray-500"> · renews {formatDate(currentPeriodEnd)}</span>
          )}
        </div>
      )}

      <button
        onClick={handleClick}
        className={`w-full py-2 font-semibold rounded-lg transition ${
          isActive
            ? 'bg-red-600 text-white hover:bg-red-700'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        {isActive ? 'Cancel Subscription' : 'Activate Subscription'}
      </button>

      {!isActive && (
        <p className="text-xs text-gray-400 text-center mt-3">
          Monthly & yearly plans available
        </p>
      )}
    </div>
  )
}