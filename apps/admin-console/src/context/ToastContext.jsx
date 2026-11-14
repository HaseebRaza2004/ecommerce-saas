"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from "react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const showToast = useCallback(
    (message, type = "info") => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setToasts((prev) => [...prev.slice(-3), { id, message, type }]);
      setTimeout(() => dismissToast(id), 4000);
    },
    [dismissToast],
  );

  const value = useMemo(() => ({ showToast }), [showToast]);

  const badgeColors = {
    success: "border-emerald-600/30 bg-emerald-950 text-emerald-100",
    error: "border-red-600/30 bg-red-950 text-red-100",
    info: "border-slate-700 bg-slate-900 text-white",
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        className="no-print fixed bottom-5 inset-e-5 z-50 flex max-w-sm flex-col gap-2"
      >
        {toasts.map((item) => (
          <div
            key={item.id}
            role="status"
            className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-xs font-medium shadow-xl ${
              badgeColors[item.type] || badgeColors.info
            }`}
          >
            <span>{item.message}</span>
            <button
              type="button"
              onClick={() => dismissToast(item.id)}
              className="opacity-70 hover:opacity-100"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);