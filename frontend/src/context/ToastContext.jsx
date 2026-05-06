import { createContext, useContext, useState, useCallback } from 'react'

const ToastContext = createContext()

let idCounter = 0

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((type, title, message) => {
    const id = ++idCounter
    setToasts(prev => [...prev, { id, type, title, message }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000)
  }, [])

  const toast = {
    success: (title, message) => addToast('success', title, message),
    error:   (title, message) => addToast('error',   title, message),
    info:    (title, message) => addToast('info',    title, message),
    warning: (title, message) => addToast('warning', title, message),
  }

  const iconMap = { success: '✓', error: '✕', info: 'ℹ', warning: '⚠' }
  const colorMap = {
    success: 'border-green-500/40 bg-green-500/10 text-green-400',
    error:   'border-red-500/40 bg-red-500/10 text-red-400',
    info:    'border-blue-500/40 bg-blue-500/10 text-blue-400',
    warning: 'border-gold/40 bg-gold/10 text-gold',
  }

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-3 pointer-events-none">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-xl border backdrop-blur-sm max-w-sm animate-slide-in-right shadow-lg bg-dark-50 ${colorMap[t.type]}`}
          >
            <span className="text-lg mt-0.5">{iconMap[t.type]}</span>
            <div>
              <p className="font-semibold text-sm text-white">{t.title}</p>
              {t.message && <p className="text-xs text-gray-400 mt-0.5">{t.message}</p>}
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  return useContext(ToastContext)
}
