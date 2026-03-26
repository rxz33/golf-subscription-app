interface SubscriptionStatusProps {
  status: string
  onToggle: () => Promise<void>
}

export default function SubscriptionStatus({
  status,
  onToggle,
}: SubscriptionStatusProps) {
  const isActive = status === 'active'

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Subscription</h2>

      <div
        className={`p-4 rounded-lg mb-6 ${
          isActive ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'
        }`}
      >
        <p className="text-sm text-gray-600 mb-2">Status</p>
        <p className={`text-2xl font-bold ${isActive ? 'text-green-600' : 'text-gray-600'}`}>
          {isActive ? '✓ Active' : '✗ Inactive'}
        </p>
      </div>

      <button
        onClick={onToggle}
        className={`w-full py-2 font-semibold rounded-lg transition ${
          isActive
            ? 'bg-red-600 text-white hover:bg-red-700'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        {isActive ? 'Cancel Subscription' : 'Activate Subscription'}
      </button>
    </div>
  )
}