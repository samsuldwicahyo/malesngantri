import { forwardRef, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

type Props = TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = forwardRef<HTMLTextAreaElement, Props>(function Textarea({ className, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      className={cn(
        'min-h-24 w-full rounded-xl border border-white/15 bg-neutral-950/75 px-4 py-3 text-sm text-neutral-100 outline-none transition placeholder:text-neutral-500 focus:border-amber-400 focus:ring-2 focus:ring-amber-500/25',
        className,
      )}
      {...props}
    />
  );
});
