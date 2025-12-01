import { toast, type ToastOptions } from 'react-toastify';

/**
 * Notification utility using react-toastify
 *
 * Provides consistent notification interface across the application.
 * Wraps react-toastify with default configuration and type-safe API.
 */

const defaultOptions: ToastOptions = {
  position: 'top-right',
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
};

/**
 * Shows a success notification
 */
export function showSuccess(message: string, options?: ToastOptions): void {
  toast.success(message, { ...defaultOptions, ...options });
}

/**
 * Shows an error notification
 */
export function showError(message: string, options?: ToastOptions): void {
  toast.error(message, { ...defaultOptions, ...options });
}

/**
 * Shows an info notification
 */
export function showInfo(message: string, options?: ToastOptions): void {
  toast.info(message, { ...defaultOptions, ...options });
}

/**
 * Shows a warning notification
 */
export function showWarning(message: string, options?: ToastOptions): void {
  toast.warning(message, { ...defaultOptions, ...options });
}

/**
 * Shows a generic notification
 */
export function showNotification(message: string, options?: ToastOptions): void {
  toast(message, { ...defaultOptions, ...options });
}
