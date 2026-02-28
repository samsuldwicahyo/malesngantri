import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'warning';
type ButtonSize = 'sm' | 'md' | 'lg';

const variantClass: Record<ButtonVariant, string> = {
  primary: 'bg-amber-500 text-neutral-950 hover:bg-amber-400',
  secondary: 'border border-white/15 bg-white/5 text-neutral-100 hover:bg-white/10',
  ghost: 'text-neutral-200 hover:bg-white/10',
  danger: 'bg-red-500/90 text-white hover:bg-red-400',
  success: 'bg-emerald-500/90 text-white hover:bg-emerald-400',
  warning: 'bg-yellow-400 text-neutral-950 hover:bg-yellow-300',
};

const sizeClass: Record<ButtonSize, string> = {
  sm: 'min-h-9 px-3 text-xs',
  md: 'min-h-11 px-4 text-sm',
  lg: 'min-h-12 px-5 text-sm',
};

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
};

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { className, variant = 'secondary', size = 'md', loading = false, disabled, children, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl font-black uppercase tracking-wider transition disabled:cursor-not-allowed disabled:opacity-60',
        variantClass[variant],
        sizeClass[size],
        className,
      )}
      {...props}
    >
      {loading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-current/25 border-t-current" /> : null}
      {children}
    </button>
  );
});
