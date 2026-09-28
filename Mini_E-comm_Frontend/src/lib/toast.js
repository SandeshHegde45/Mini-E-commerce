import { toast as toastManager } from "@/components/ui/toast";

// Small helper over shadcn's toast manager: toast.success("Title", "Description")
const show = (type) => (title, description) => toastManager.add({ type, title, description });

export const toast = {
  success: show("success"),
  error: show("error"),
  info: show("info"),
  warning: show("warning"),
};
