import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

type Props = InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, Props>(function Input({ className, ...props }, ref) {
  return (
    <input
      ref={ref}
      className={cn(
        'min-h-11 w-full rounded-xl border border-white/15 bg-neutral-950/75 px-4 py-3 text-sm text-neutral-100 outline-none transition placeholder:text-neutral-500 focus:border-amber-400 focus:ring-2 focus:ring-amber-500/25',
        className,
      )}
      {...props}
    />
  );
});
