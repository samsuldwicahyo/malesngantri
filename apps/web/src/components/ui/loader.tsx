import { cn } from '@/lib/cn';

type Props = {
  className?: string;
  label?: string;
};

export const Loader = ({ className, label = 'Memuat...' }: Props) => (
  <div className={cn('inline-flex items-center gap-2 text-sm text-neutral-300', className)}>
    <span className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-200/20 border-t-neutral-200" />
    <span>{label}</span>
  </div>
);
