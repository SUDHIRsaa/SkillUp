export default function Card({ title, children, actions, className = '', ...props }) {
  // Extract onClick to add keyboard accessibility when clickable
  const { onClick, ...rest } = props;

  const handleKeyDown = (e) => {
    if (!onClick) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick(e);
    }
  };

  return (
    <div
      {...rest}
      onKeyDown={handleKeyDown}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      className={`rounded-xl border border-gray-100 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900 p-6 transition-all hover:-translate-y-[2px] hover:shadow-lg ${className}`}
    >
      {title && (
        <div className="mb-4 font-semibold text-gray-900 dark:text-gray-100 flex items-center justify-between text-lg">
          {title}
          <div>{actions}</div>
        </div>
      )}
      <div className="text-gray-700 dark:text-gray-200 leading-relaxed">{children}</div>
    </div>
  );
}
