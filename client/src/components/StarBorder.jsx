export default function StarBorder({ as: As = 'div', className = '', color = 'cyan', speed = '4s', children, ...rest }) {
  const containerCls = `relative rounded-xl p-[1px] overflow-hidden ${className}`;
  const spinCls = `absolute inset-0 pointer-events-none animate-[spin_${speed}_linear_infinite]`;
  const ringCls = `absolute -inset-[40%] bg-[conic-gradient(var(--tw-gradient-stops))] from-${color}-400 via-transparent to-${color}-400 rounded-full opacity-60`;
  return (
    <As className={containerCls} {...rest}>
      <div className={spinCls}>
        <div className={ringCls} />
      </div>
      <div className="relative rounded-[11px] bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
        {children}
      </div>
    </As>
  );
}