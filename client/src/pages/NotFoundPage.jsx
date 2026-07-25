export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center bg-white dark:bg-slate-950">
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">404</p>
      <h1 className="mt-2 text-2xl font-bold text-gray-900 dark:text-gray-100">Page not found</h1>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">The page you are looking for does not exist.</p>
    </div>
  );
}