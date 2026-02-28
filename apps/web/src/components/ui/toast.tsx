import { type HTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

type ToastVariant = 'success' | 'danger' | 'warning' | 'info';

const toneClass: Record<ToastVariant, string> = {
  success: 'border-emerald-300/35 bg-emerald-500/15 text-emerald-100',
  danger: 'border-rose-300/35 bg-rose-500/15 text-rose-100',
  warning: 'border-yellow-300/35 bg-yellow-500/15 text-yellow-100',
  info: 'border-sky-300/35 bg-sky-500/15 text-sky-100',
};

type Props = HTMLAttributes<HTMLDivElement> & {
  variant?: ToastVariant;
};

export const Toast = ({ className, variant = 'info', ...props }: Props) => (
  <div
    className={cn(
      'rounded-2xl border px-4 py-3 text-sm font-semibold shadow-lg',
      toneClass[variant],
      className,
    )}
    {...props}
  />
);
