import { toast, type ToastOptions } from "react-toastify";

const defaultToastOptions: ToastOptions = {
  autoClose: 3000,
};

export const CoreToast = {
  success: (msg: string, options?: ToastOptions) =>
    toast.success(msg, { ...defaultToastOptions, ...options }),
  error: (msg: string, options?: ToastOptions) =>
    toast.error(msg, { ...defaultToastOptions, ...options }),
  info: (msg: string, options?: ToastOptions) =>
    toast.info(msg, { ...defaultToastOptions, ...options }),
  warning: (msg: string, options?: ToastOptions) =>
    toast.warning(msg, { ...defaultToastOptions, ...options }),
};
