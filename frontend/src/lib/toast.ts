import { toast } from "sonner";

/**
 * Utility functions for toast notifications
 */

export const showSuccess = (message: string, description?: string) => {
  toast.success(message, { description });
};

export const showError = (message: string, description?: string) => {
  toast.error(message, { description });
};

export const showInfo = (message: string, description?: string) => {
  toast.info(message, { description });
};

export const showWarning = (message: string, description?: string) => {
  toast.warning(message, { description });
};

const toastUtils = {
  success: showSuccess,
  error: showError,
  info: showInfo,
  warning: showWarning,
};

export default toastUtils; 