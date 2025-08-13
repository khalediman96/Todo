// app/loading.tsx
export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <div className="absolute top-0 left-0 animate-ping rounded-full h-12 w-12 border-b-2 border-blue-300 opacity-30"></div>
        </div>
        <div className="text-center">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">Loading...</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Please wait while content is loaded
          </p>
        </div>
      </div>
    </div>
  );
}