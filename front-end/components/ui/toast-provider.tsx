'use client'

import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react'

type ToastType = 'success' | 'error' | 'info' | 'warning'

interface Toast {
  id: string
  type: ToastType
  title: string
  message?: string
  duration?: number
}

interface ToastContextType {
  toast: (options: Omit<Toast, 'id'>) => void
  success: (title: string, message?: string) => void
  error: (title: string, message?: string) => void
  info: (title: string, message?: string) => void
  warning: (title: string, message?: string) => void
}

const ToastContext = createContext<ToastContextType | null>(null)

const icons = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
}

const styles = {
  success: {
    container: 'border-l-4 border-emerald-500 bg-white shadow-xl shadow-emerald-100',
    icon: 'text-emerald-500',
    title: 'text-emerald-800',
    message: 'text-emerald-700',
    bar: 'bg-emerald-500',
  },
  error: {
    container: 'border-l-4 border-red-500 bg-white shadow-xl shadow-red-100',
    icon: 'text-red-500',
    title: 'text-red-800',
    message: 'text-red-700',
    bar: 'bg-red-500',
  },
  info: {
    container: 'border-l-4 border-blue-500 bg-white shadow-xl shadow-blue-100',
    icon: 'text-blue-500',
    title: 'text-blue-800',
    message: 'text-blue-700',
    bar: 'bg-blue-500',
  },
  warning: {
    container: 'border-l-4 border-amber-500 bg-white shadow-xl shadow-amber-100',
    icon: 'text-amber-500',
    title: 'text-amber-800',
    message: 'text-amber-700',
    bar: 'bg-amber-500',
  },
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  const [visible, setVisible] = useState(false)
  const [progress, setProgress] = useState(100)
  const duration = toast.duration ?? 4000
  const style = styles[toast.type]
  const Icon = icons[toast.type]
  const intervalRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    // Trigger enter animation
    requestAnimationFrame(() => setVisible(true))

    const startTime = Date.now()
    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100)
      setProgress(remaining)
      if (remaining === 0) {
        clearInterval(intervalRef.current)
        handleRemove()
      }
    }, 50)

    return () => clearInterval(intervalRef.current)
  }, [])

  const handleRemove = () => {
    setVisible(false)
    setTimeout(() => onRemove(toast.id), 350)
  }

  return (
    <div
      className={`relative overflow-hidden rounded-2xl min-w-[300px] max-w-[380px] transition-all duration-350 ease-out ${style.container} ${
        visible ? 'opacity-100 translate-x-0 scale-100' : 'opacity-0 translate-x-full scale-95'
      }`}
      style={{ transition: 'all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
    >
      <div className="flex items-start gap-3 p-4 pr-10">
        <Icon className={`h-5 w-5 mt-0.5 shrink-0 ${style.icon}`} />
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-semibold ${style.title}`}>{toast.title}</p>
          {toast.message && (
            <p className={`text-xs mt-0.5 ${style.message} leading-relaxed`}>{toast.message}</p>
          )}
        </div>
      </div>

      {/* Close button */}
      <button
        onClick={handleRemove}
        className="absolute top-3 right-3 p-1 rounded-full hover:bg-gray-100 transition-colors"
      >
        <X className="h-3.5 w-3.5 text-gray-400" />
      </button>

      {/* Progress bar */}
      <div
        className={`absolute bottom-0 left-0 h-1 ${style.bar} transition-all ease-linear`}
        style={{ width: `${progress}%`, transition: 'width 50ms linear' }}
      />
    </div>
  )
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const addToast = useCallback((options: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    setToasts(prev => [...prev.slice(-4), { ...options, id }]) // max 5 toasts
  }, [])

  const ctx: ToastContextType = {
    toast: addToast,
    success: (title, message) => addToast({ type: 'success', title, message }),
    error: (title, message) => addToast({ type: 'error', title, message }),
    info: (title, message) => addToast({ type: 'info', title, message }),
    warning: (title, message) => addToast({ type: 'warning', title, message }),
  }

  return (
    <ToastContext.Provider value={ctx}>
      {children}

      {/* Toast Container - bottom right */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 items-end pointer-events-none">
        {toasts.map(t => (
          <div key={t.id} className="pointer-events-auto">
            <ToastItem toast={t} onRemove={removeToast} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
