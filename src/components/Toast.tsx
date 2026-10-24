import React from 'react';
import { ToastMessage } from '../types';

interface ToastProps {
  toast: ToastMessage | null;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  if (!toast) return null;

  return (
    <div className="fixed bottom-24 right-6 sm:bottom-28 sm:right-8 z-50 flex items-center gap-3 px-5 py-3.5 bg-[#131B2E] text-white rounded-2xl shadow-2xl border border-slate-700 max-w-md animate-bounce">
      <span className="material-symbols-outlined text-emerald-400 text-2xl shrink-0">
        {toast.type === 'error' ? 'error' : 'check_circle'}
      </span>
      <div className="text-xs sm:text-sm font-medium leading-snug flex-1">
        {toast.message}
      </div>
      <button
        onClick={onClose}
        className="text-slate-400 hover:text-white ml-2 text-sm p-1 rounded-full hover:bg-slate-800 transition-colors cursor-pointer"
        aria-label="Close notification"
      >
        ✕
      </button>
    </div>
  );
};
