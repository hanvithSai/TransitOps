export const Table = ({ children, className = '' }) => (
  <div className={`w-full overflow-x-auto rounded-[10px] border border-[var(--border-base)] bg-[var(--bg-surface)] shadow-sm ${className}`}>
    <table className="w-full text-left text-sm">
      {children}
    </table>
  </div>
);

export const TableHead = ({ children }) => (
  <thead className="border-b border-[var(--border-base)] bg-[var(--bg-base)] text-[11px] font-semibold tracking-wider text-[var(--text-secondary)] uppercase">
    <tr>{children}</tr>
  </thead>
);

export const TableRow = ({ children, className = '', onClick }) => (
  <tr 
    onClick={onClick}
    className={`border-b border-[var(--border-base)] last:border-0 transition-colors hover:bg-[var(--bg-surface-hover)] ${onClick ? 'cursor-pointer' : ''} ${className}`}
  >
    {children}
  </tr>
);

export const TableHeader = ({ children, className = '' }) => (
  <th className={`px-4 py-3 ${className}`}>{children}</th>
);

export const TableCell = ({ children, className = '' }) => (
  <td className={`px-4 py-3 text-[var(--text-primary)] ${className}`}>{children}</td>
);
