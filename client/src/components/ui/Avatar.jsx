export default function Avatar({ name = '', size = 32 }) {
  const initials = name.split(' ').map(p => p[0]).join('').slice(0,2).toUpperCase();
  return (
    <span style={{ width: size, height: size }} className="inline-flex items-center justify-center rounded-full bg-brand-600 text-white text-xs font-semibold">
      {initials || 'S'}
    </span>
  );
}
