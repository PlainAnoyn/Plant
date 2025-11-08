export default function LoadingSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md dark:shadow-slate-900/50 overflow-hidden border border-slate-200 dark:border-slate-700">
        <div className="h-64 bg-gray-200 dark:bg-slate-700"></div>
        <div className="p-4">
          <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-1/2 mb-4"></div>
          <div className="h-6 bg-gray-200 dark:bg-slate-700 rounded w-1/3"></div>
        </div>
      </div>
    </div>
  );
}

