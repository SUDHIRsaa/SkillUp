export default function Input({ label, hint, error, className = '', icon: Icon, ...props }) {
  const invalid = !!error;
  return (
    <div className="relative">
      {label && <label className="block text-sm font-medium mb-1">{label}</label>}
      <div className={`relative`}> 
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <Icon className="h-5 w-5" />
          </div>
        )}
        <input
          className={`block w-full rounded-md shadow-sm focus:border-brand-600 focus:ring-brand-600 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100 ${invalid ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300'} ${Icon ? 'pl-10' : 'pl-3'} ${className}`}
          {...props}
        />
      </div>
      {error ? (
        <div className="text-xs mt-1 text-red-500">{error}</div>
      ) : hint ? (
        <div className="text-xs mt-1 text-gray-500 dark:text-gray-400">{hint}</div>
      ) : null}
    </div>
  );
}
