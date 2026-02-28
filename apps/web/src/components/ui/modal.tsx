import { type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/cn';

type Props = {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  onConfirm?: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmVariant?: 'primary' | 'danger';
  loading?: boolean;
  children?: ReactNode;
};

export const Modal = ({
  open,
  title,
  description,
  onClose,
  onConfirm,
  confirmLabel = 'Simpan',
  cancelLabel = 'Batal',
  confirmVariant = 'primary',
  loading = false,
  children,
}: Props) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-neutral-950 p-5 shadow-2xl">
        <h3 className="text-lg font-black text-neutral-100">{title}</h3>
        {description ? <p className="mt-2 text-sm text-neutral-400">{description}</p> : null}
        {children ? <div className="mt-4">{children}</div> : null}
        <div className={cn('mt-5 flex justify-end gap-2')}>
          <Button type="button" variant="ghost" onClick={onClose}>
            {cancelLabel}
          </Button>
          {onConfirm ? (
            <Button type="button" variant={confirmVariant === 'danger' ? 'danger' : 'primary'} loading={loading} onClick={onConfirm}>
              {confirmLabel}
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
};
