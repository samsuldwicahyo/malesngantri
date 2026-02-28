import { type HTMLAttributes, type TableHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

export const Table = ({ className, ...props }: TableHTMLAttributes<HTMLTableElement>) => (
  <table className={cn('w-full text-left text-sm', className)} {...props} />
);

export const THead = ({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>) => (
  <thead className={cn('text-xs uppercase tracking-wider text-neutral-400', className)} {...props} />
);

export const TBody = ({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>) => (
  <tbody className={cn('text-neutral-100', className)} {...props} />
);

export const TR = ({ className, ...props }: HTMLAttributes<HTMLTableRowElement>) => (
  <tr className={cn('border-t border-white/10', className)} {...props} />
);

export const TH = ({ className, ...props }: HTMLAttributes<HTMLTableCellElement>) => (
  <th className={cn('py-3 pr-3 font-semibold', className)} {...props} />
);

export const TD = ({ className, ...props }: HTMLAttributes<HTMLTableCellElement>) => (
  <td className={cn('py-3 pr-3 align-top', className)} {...props} />
);
