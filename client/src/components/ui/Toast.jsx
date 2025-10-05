import { useState, useEffect } from 'react';

export default function Toast({ message, type = 'info', onClose }) {
  useEffect(() => {
    const t = setTimeout(() => onClose && onClose(), 5000);
    return () => clearTimeout(t);
  }, []);
  const color = type === 'error' ? 'bg-red-600' : type === 'success' ? 'bg-emerald-600' : 'bg-sky-600';
  return (
    <div className={`fixed right-4 bottom-6 z-50 ${color} text-white px-4 py-2 rounded shadow-lg`}>{message}</div>
  );
}
