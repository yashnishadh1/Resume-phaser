export type ToastKind = "success" | "error" | "info";

export interface ToastMessage {
  id: string;
  message: string;
  kind: ToastKind;
}

export function notify(message: string, kind: ToastKind = "info") {
  window.dispatchEvent(new CustomEvent<ToastMessage>("hirelens:toast", {
    detail: { id: `${Date.now()}-${Math.random()}`, message, kind },
  }));
}
