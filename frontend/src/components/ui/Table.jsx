import { cn } from "../../lib/utils";

export const Table = ({ children, className }) => (
  <div className={cn("w-full overflow-x-auto rounded-xl border border-[var(--border-base)] bg-[var(--bg-surface)] shadow-sm", className)}>
    <table className="w-full text-left text-sm">
      {children}
    </table>
  </div>
);

export const TableHead = ({ children, className }) => (
  <thead className={cn("border-b border-[var(--border-base)] bg-[var(--bg-base)] text-[11px] font-semibold tracking-wider text-[var(--text-secondary)] uppercase", className)}>
    <tr>{children}</tr>
  </thead>
);

export const TableRow = ({ children, className, onClick }) => (
  <tr 
    onClick={onClick}
    className={cn(
      "border-b border-[var(--border-base)] last:border-0 transition-colors hover:bg-[var(--bg-surface-hover)]",
      onClick && "cursor-pointer",
      className
    )}
  >
    {children}
  </tr>
);

export const TableHeader = ({ children, className }) => (
  <th className={cn("px-6 py-4 whitespace-nowrap", className)}>{children}</th>
);

export const TableCell = ({ children, className }) => (
  <td className={cn("px-6 py-4 text-[var(--text-primary)]", className)}>{children}</td>
);
