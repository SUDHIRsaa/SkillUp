export default function Button({ as = 'button', variant = 'primary', className = '', type, leadingIcon: Leading, trailingIcon: Trailing, loading = false, disabled, ...props }) {
  const base = 'inline-flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-brand-500 active:scale-[0.98]';
  const variants = {
    primary: 'bg-brand-600 text-white hover:bg-brand-700',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    ghost: 'bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800',
    gradient: 'text-white bg-gradient-to-r from-brand-600 via-accent-500 to-brand-600 hover:from-brand-700 hover:to-accent-600',
  };
  const Comp = as;
  const extra = Comp === 'button' ? { type: type || 'button' } : {};
  return (
    <Comp className={`${base} ${variants[variant]} ${className} ${loading || disabled ? 'opacity-70 cursor-not-allowed' : ''}`} disabled={loading || disabled} {...extra} {...props}>
      {loading ? (
        <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
      ) : null}
      {props.children}
    </Comp>
  );
}
