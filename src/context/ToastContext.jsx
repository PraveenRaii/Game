import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X, Sparkles } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback(({ title, message, type = 'info', duration = 3500 }) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    const newToast = { id, title, message, type };

    setToasts((prev) => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      {/* Toast Render Portal */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.9 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="pointer-events-auto rounded-xl p-3.5 backdrop-blur-xl shadow-xl flex items-start gap-3 border transition-all"
              style={{
                background:
                  toast.type === 'success'
                    ? 'rgba(6, 40, 32, 0.9)'
                    : toast.type === 'error'
                    ? 'rgba(45, 12, 18, 0.9)'
                    : toast.type === 'achievement'
                    ? 'rgba(38, 16, 56, 0.9)'
                    : 'rgba(15, 23, 42, 0.9)',
                borderColor:
                  toast.type === 'success'
                    ? 'rgba(16, 185, 129, 0.4)'
                    : toast.type === 'error'
                    ? 'rgba(239, 68, 68, 0.4)'
                    : toast.type === 'achievement'
                    ? 'rgba(168, 85, 247, 0.5)'
                    : 'rgba(56, 189, 248, 0.4)',
              }}
            >
              <div className="mt-0.5 shrink-0">
                {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-400" />}
                {toast.type === 'achievement' && <Sparkles className="w-5 h-5 text-purple-400 animate-spin" />}
                {toast.type === 'info' && <Info className="w-5 h-5 text-cyan-400" />}
              </div>

              <div className="flex-1 min-w-0">
                {toast.title && (
                  <h4 className="text-sm font-semibold text-white tracking-wide">
                    {toast.title}
                  </h4>
                )}
                {toast.message && (
                  <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                    {toast.message}
                  </p>
                )}
              </div>

              <button
                onClick={() => removeToast(toast.id)}
                className="text-slate-400 hover:text-white transition-colors p-1"
                aria-label="Close notification"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};
