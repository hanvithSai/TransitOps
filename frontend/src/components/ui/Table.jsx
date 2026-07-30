import { cn } from '../../lib/utils';

export const Table = ({ children, className }) => (
  <div className={cn('app-table-wrap', className)}>
    <table className="app-table">{children}</table>
  </div>
);

export const TableHead = ({ children, className }) => (
  <thead className={cn('app-table-head', className)}>
    <tr>{children}</tr>
  </thead>
);

export const TableRow = ({ children, className, onClick, selected }) => (
  <tr
    onClick={onClick}
    className={cn(
      'app-table-row',
      onClick && 'cursor-pointer',
      selected && 'table-row-selected',
      className,
    )}
  >
    {children}
  </tr>
);

export const TableHeader = ({ children, className, align }) => (
  <th className={cn('app-table-th', align === 'right' && 'text-right', className)}>{children}</th>
);

export const TableCell = ({ children, className, mono, align }) => (
  <td className={cn('app-table-td', mono && 'text-mono-data', align === 'right' && 'text-right', className)}>
    {children}
  </td>
);
