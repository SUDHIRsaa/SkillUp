export default function Select({ className='', ...props }) {
  return <select className={`rounded-md border-gray-300 focus:border-brand-600 focus:ring-brand-600 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100 ${className}`} {...props} />;
}
