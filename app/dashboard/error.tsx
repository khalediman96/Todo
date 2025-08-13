'use client';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mx-4">
        <div className="text-center">
          <div className="text-6xl mb-4">📋</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Dashboard Error
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Failed to load your dashboard. Please check your connection and try again.
          </p>
          <div className="space-y-3">
            <button
              onClick={reset}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
            >
              Retry Dashboard
            </button>
            <button
              onClick={() => window.location.href = '/login'}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
