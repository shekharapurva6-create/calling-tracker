import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';
import { clsx } from 'clsx';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
  title?: string;
  duration?: number;
}

let toastListener: ((toast: ToastMessage) => void) | null = null;

export const showToast = (message: string, type: ToastType = 'success', title?: string, duration = 3500) => {
  if (toastListener) {
    toastListener({
      id: Math.random().toString(36).substring(2, 9),
      type,
      message,
      title,
      duration,
    });
  }
};

export const Toaster: React.FC = () => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    toastListener = (newToast: ToastMessage) => {
      setToasts((prev) => [...prev, newToast]);

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
      }, newToast.duration || 3500);
    };

    return () => {
      toastListener = null;
    };
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none p-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={clsx(
            'pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl shadow-lg border text-sm font-medium transition-all duration-300 animate-in slide-in-from-bottom-3',
            t.type === 'success' && 'bg-[#FFFFFF] border-[#16C763]/40 text-[#172017]',
            t.type === 'error' && 'bg-[#FFFFFF] border-[#E53935]/40 text-[#172017]',
            t.type === 'warning' && 'bg-[#FFFFFF] border-[#F59E0B]/40 text-[#172017]',
            t.type === 'info' && 'bg-[#FFFFFF] border-[#3B82F6]/40 text-[#172017]'
          )}
        >
          <div className="shrink-0 mt-0.5">
            {t.type === 'success' && <CheckCircle2 className="w-5 h-5 text-[#0BAA45]" />}
            {t.type === 'error' && <XCircle className="w-5 h-5 text-[#E53935]" />}
            {t.type === 'warning' && <AlertTriangle className="w-5 h-5 text-[#F59E0B]" />}
            {t.type === 'info' && <Info className="w-5 h-5 text-[#3B82F6]" />}
          </div>
          <div className="flex-1 min-w-0">
            {t.title && <div className="font-bold text-[#172017]">{t.title}</div>}
            <div className="text-xs text-[#4B5563] leading-relaxed">{t.message}</div>
          </div>
          <button
            onClick={() => removeToast(t.id)}
            className="text-[#9CA3AF] hover:text-[#172017] p-1 rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
