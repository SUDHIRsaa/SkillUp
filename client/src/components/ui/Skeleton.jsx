export default function Skeleton({ className = '' }) {
  return (
    <div className={`animate-pulse bg-gray-200 dark:bg-gray-800 rounded-md ${className}`} />
  );
}
