import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { CircleCheck, CircleAlert, Info, X } from "lucide-react";
import type { ToastKind, ToastMessage } from "@/lib/notifications";

type ToastContextValue = (message: string, kind?: ToastKind) => void;
const ToastContext = createContext<ToastContextValue>(() => undefined);

export function useToast() {
  return useContext(ToastContext);
}

export default function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback((message: string, kind: ToastKind = "info") => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((current) => [...current.slice(-3), { id, message, kind }]);
    window.setTimeout(() => dismiss(id), 5000);
  }, [dismiss]);

  useEffect(() => {
    const onToast = (event: Event) => {
      const { message, kind } = (event as CustomEvent<ToastMessage>).detail;
      showToast(message, kind);
    };
    window.addEventListener("hirelens:toast", onToast);
    return () => window.removeEventListener("hirelens:toast", onToast);
  }, [showToast]);

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      <div className="fixed right-4 top-4 z-[100] flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-2" aria-live="polite" aria-relevant="additions">
        {toasts.map((toast) => {
          const Icon = toast.kind === "success" ? CircleCheck : toast.kind === "error" ? CircleAlert : Info;
          const color = toast.kind === "success" ? "text-emerald-400" : toast.kind === "error" ? "text-rose-400" : "text-blue-300";
          return (
            <div key={toast.id} role={toast.kind === "error" ? "alert" : "status"} className="flex items-start gap-3 rounded-xl border border-slate-700 bg-slate-900 p-4 text-sm text-slate-100 shadow-2xl">
              <Icon className={`mt-0.5 size-5 shrink-0 ${color}`} aria-hidden="true" />
              <p className="min-w-0 flex-1">{toast.message}</p>
              <button type="button" onClick={() => dismiss(toast.id)} aria-label="Dismiss notification" className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-400">
                <X className="size-4" aria-hidden="true" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
