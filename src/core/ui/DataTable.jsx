import clsx from 'clsx';

/**
 * Mobile-first "table": renders as a stacked card list on narrow screens,
 * as an actual table on md+ breakpoints. Pass columns: [{ key, header, render }].
 */
export default function DataTable({ columns, rows, keyOf, emptyNode, rowHref, onRowClick }) {
  if (!rows?.length) return emptyNode ?? null;

  return (
    <div>
      {/* Mobile cards */}
      <ul className="md:hidden space-y-3">
        {rows.map((row, i) => (
          <li
            key={keyOf ? keyOf(row) : i}
            className="card p-4 cursor-pointer active:scale-[0.99] transition"
            onClick={() => onRowClick?.(row)}
          >
            {columns.map((col) => (
              <div key={col.key} className="flex justify-between gap-3 py-1">
                <span className="text-xs font-medium uppercase tracking-wide text-ink-500">{col.header}</span>
                <span className="text-sm text-right min-w-0 truncate">
                  {col.render ? col.render(row) : row[col.key]}
                </span>
              </div>
            ))}
          </li>
        ))}
      </ul>

      {/* Desktop table */}
      <div className="hidden md:block card overflow-hidden p-0">
        <table className="w-full text-sm">
          <thead className="bg-ink-100/60 dark:bg-white/5">
            <tr>
              {columns.map((col) => (
                <th key={col.key} className="text-left font-medium text-ink-500 px-4 py-3">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={keyOf ? keyOf(row) : i}
                className={clsx(
                  'border-t border-ink-100/60 dark:border-white/5',
                  (onRowClick || rowHref) && 'hover:bg-ink-100/60 dark:hover:bg-white/5 cursor-pointer'
                )}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3 align-middle">
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
