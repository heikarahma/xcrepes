import React, { useEffect } from 'react';
import { useUnit } from '../../controllers/UnitController';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

let globalShowToast = null;

export const toast = {
  success: (message, title = 'Berhasil') => {
    if (typeof globalShowToast === 'function') {
      globalShowToast(message, 'success', title);
    } else {
      console.log(`[Toast Success] ${message}`);
    }
  },
  error: (message, title = 'Peringatan') => {
    if (typeof globalShowToast === 'function') {
      globalShowToast(message, 'error', title);
    } else {
      console.error(`[Toast Error] ${message}`);
    }
  },
  info: (message, title = 'Informasi') => {
    if (typeof globalShowToast === 'function') {
      globalShowToast(message, 'info', title);
    } else {
      console.info(`[Toast Info] ${message}`);
    }
  },
  warning: (message, title = 'Perhatian') => {
    if (typeof globalShowToast === 'function') {
      globalShowToast(message, 'warning', title);
    } else {
      console.warn(`[Toast Warning] ${message}`);
    }
  }
};

export const ToastContainer = () => {
  const { toasts, removeToast, showToast } = useUnit();

  useEffect(() => {
    globalShowToast = showToast;
    return () => {
      globalShowToast = null;
    };
  }, [showToast]);

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="blue-toast-container">
      {toasts.map((item) => {
        let Icon = Info;
        let toastClass = 'toast-info';

        if (item.type === 'success') {
          Icon = CheckCircle2;
          toastClass = 'toast-success';
        } else if (item.type === 'error' || item.type === 'warning') {
          Icon = AlertCircle;
          toastClass = 'toast-error';
        }

        return (
          <div key={item.id} className={`blue-toast ${toastClass}`}>
            <Icon size={20} style={{ flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              {item.title && <div className="font-bold text-sm">{item.title}</div>}
              <div>{item.message}</div>
            </div>
            <button
              onClick={() => removeToast(item.id)}
              style={{ color: 'rgba(255, 255, 255, 0.8)', cursor: 'pointer' }}
            >
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
};
