import { createContext, useContext, useState, useCallback } from 'react';
import './ToastAlert.css';

export const TOAST_TYPES = {
    SUCCESS: 'success',
    ERROR: 'error',
    INFO: 'info',
    WARNING: 'warning',
}

const ToastContext = createContext(null);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

const Toast = ({ id, message, type, onClose }) => {
    const getIcon = () => {
      switch (type) {
        case TOAST_TYPES.SUCCESS:
          return '✓';
        case TOAST_TYPES.ERROR:
          return '✗';
        case TOAST_TYPES.WARNING:
          return '⚠';
        case TOAST_TYPES.INFO:
        default:
          return 'ℹ';
      }
    };

    return (
        <div className={`toast toast-${type}`} role="alert">
          <div className="toast-content">
            <span className="toast-icon">{getIcon()}</span>
            <span className="toast-message">{message}</span>
          </div>
          <button 
            onClick={() => onClose(id)} 
            className="toast-close-btn"
            aria-label="Close"
          >
            ×
          </button>
        </div>
      );
};

const ToastContainer = ({ toasts, removeToast }) => {
    return (
      <div className="toast-container">
        {toasts.map((toast) => (
          <Toast 
            key={toast.id} 
            id={toast.id} 
            message={toast.message} 
            type={toast.type} 
            onClose={removeToast} 
          />
        ))}
      </div>
    );
};

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);
  
    // Add a new toast
    const addToast = useCallback((message, type = TOAST_TYPES.INFO, duration = 4000) => {
      const id = Date.now().toString();
      
      setToasts((prevToasts) => [...prevToasts, { id, message, type }]);
      
      // Auto remove toast after duration
      if (duration) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
      
      return id;
    }, []);

    const removeToast = useCallback((id) => {
        setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
      }, []);
    const success = useCallback((message, duration) => {
        return addToast(message, TOAST_TYPES.SUCCESS, duration);
    }, [addToast]);
    const error = useCallback((message, duration) => {
        return addToast(message, TOAST_TYPES.ERROR, duration);
    }, [addToast]);
    const info = useCallback((message, duration) => {
        return addToast(message, TOAST_TYPES.INFO, duration);
      }, [addToast]);
    const warning = useCallback((message, duration) => {
        return addToast(message, TOAST_TYPES.WARNING, duration);
    }, [addToast]);

    const value = {
        addToast,
        removeToast,
        success,
        error,
        info,
        warning,
      };

    return (
        <ToastContext.Provider value={value}>
          {children}
          <ToastContainer toasts={toasts} removeToast={removeToast} />
        </ToastContext.Provider>
    );
};