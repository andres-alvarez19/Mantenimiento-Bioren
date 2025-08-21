import { useState } from 'react';

export interface Toast {
  message: string;
  type?: 'success' | 'error' | 'info';
}

export const useToast = () => {
  const [toast, setToast] = useState<Toast | null>(null);
  const showToast = (message: string, type: Toast['type'] = 'info') => setToast({ message, type });
  const clearToast = () => setToast(null);
  return { toast, showToast, clearToast };
};
