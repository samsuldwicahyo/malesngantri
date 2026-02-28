import { type HTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

type BadgeVariant = 'default' | 'success' | 'danger' | 'warning' | 'info' | 'muted';

const variantClass: Record<BadgeVariant, string> = {
  default: 'border-white/20 bg-white/5 text-neutral-100',
  success: 'border-emerald-300/30 bg-emerald-500/15 text-emerald-200',
  danger: 'border-rose-300/30 bg-rose-500/15 text-rose-200',
  warning: 'border-yellow-300/30 bg-yellow-500/15 text-yellow-200',
  info: 'border-sky-300/30 bg-sky-500/15 text-sky-200',
  muted: 'border-neutral-300/20 bg-neutral-500/15 text-neutral-200',
};

type Props = HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
};

export const Badge = ({ className, variant = 'default', ...props }: Props) => (
  <span
    className={cn(
      'inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider',
      variantClass[variant],
      className,
    )}
    {...props}
  />
);
