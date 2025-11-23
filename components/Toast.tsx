import React, { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, X } from './Icons';

export interface ToastEventDetail {
  message: string;
  type: 'success' | 'error' | 'info';
}

export const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
  const event = new CustomEvent('show-toast', { detail: { message, type } });
  window.dispatchEvent(event);
};

const ToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<{ id: number; message: string; type: string }[]>([]);

  useEffect(() => {
    const handleToast = (e: Event) => {
      const detail = (e as CustomEvent<ToastEventDetail>).detail;
      const id = Date.now();
      setToasts((prev) => [...prev, { ...detail, id }]);

      // Auto remove
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3000);
    };

    window.addEventListener('show-toast', handleToast);
    return () => window.removeEventListener('show-toast', handleToast);
  }, []);

  return (
    <div className="fixed top-4 left-0 right-0 z-[100] flex flex-col items-center gap-2 pointer-events-none px-4">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="animate-fade-in-up glass-panel bg-black/80 backdrop-blur-xl border border-white/20 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 min-w-[300px] max-w-sm pointer-events-auto"
        >
          {toast.type === 'success' && <CheckCircle className="text-green-400" size={20} />}
          {toast.type === 'error' && <AlertCircle className="text-red-400" size={20} />}
          {toast.type === 'info' && <CheckCircle className="text-blue-400" size={20} />}
          
          <span className="text-sm font-medium flex-1">{toast.message}</span>
          
          <button 
            onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
            className="text-gray-400 hover:text-white"
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;