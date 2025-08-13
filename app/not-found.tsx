import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mx-4">
        <div className="text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Page Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <div className="space-y-3">
            <Link
              href="/dashboard"
              className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 text-center"
            >
              Go to Dashboard
            </Link>
            <Link
              href="/"
              className="block w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 text-center"
            >
              Go Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
