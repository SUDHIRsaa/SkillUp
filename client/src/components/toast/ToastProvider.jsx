import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

const ToastCtx = createContext(null);

let idCounter = 1;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => setToasts((ts) => ts.filter((t) => t.id !== id)), []);

  const push = useCallback((type, message, { timeout = 2500 } = {}) => {
    const id = idCounter++;
    setToasts((ts) => [...ts, { id, type, message }]);
    if (timeout) setTimeout(() => remove(id), timeout);
    return id;
  }, [remove]);

  const api = useMemo(() => ({
    show: push,
    success: (m, opts) => push('success', m, opts),
    error: (m, opts) => push('error', m, opts),
    info: (m, opts) => push('info', m, opts),
    remove,
  }), [push, remove]);

  return (
    <ToastCtx.Provider value={api}>
      {children}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((t) => (
          <div key={t.id}
               className={
                 `rounded-md px-4 py-2 text-sm shadow border ` +
                 (t.type === 'success' ? 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/30 dark:border-green-800 dark:text-green-200'
                  : t.type === 'error' ? 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/30 dark:border-red-800 dark:text-red-200'
                  : 'bg-gray-50 border-gray-200 text-gray-800 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200')
               }>
            {t.message}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export const useToast = () => {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};
