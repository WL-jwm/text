import React from 'react';
import { Database } from 'lucide-react';

export function TechTable({ headers, rows, highlightOnHover = true, pageSize = 0, showRowNumbers = false, title }: {
  headers: string[]; rows: (string | number | null | undefined)[][]; highlightOnHover?: boolean;
  pageSize?: number; showRowNumbers?: boolean; title?: string;
}) {
  const [currentPage, setCurrentPage] = React.useState(1);

  const effectivePageSize = pageSize > 0 ? pageSize : rows.length;
  const totalPages = Math.max(1, Math.ceil(rows.length / effectivePageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const pagedRows = pageSize > 0 ? rows.slice((safeCurrentPage - 1) * effectivePageSize, safeCurrentPage * effectivePageSize) : rows;
  const startIdx = (safeCurrentPage - 1) * effectivePageSize;

  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gw-muted/50">
        <Database size={32} strokeWidth={1} className="mb-3 opacity-30" />
        <p className="text-xs">{title ? `${title} — ` : ''}暂无数据</p>
      </div>
    );
  }

  return (
    <div>
      {title && (
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-xs font-medium text-gw-muted">{title}</h4>
          <span className="text-[10px] text-gw-muted/40 font-mono">{rows.length} 条记录</span>
        </div>
      )}
      <div className="overflow-x-auto -mx-1 px-1">
        <table className="w-full text-sm min-w-[600px]"><caption className="sr-only">{title || '数据表格'}</caption>
          <thead>
            <tr className="border-b border-gw-border/80">
              {showRowNumbers && <th scope="col" className="text-center text-gw-muted/40 py-2.5 px-2 text-[10px] font-mono w-10">#</th>}
              {headers.map((h, i) => (
                <th key={i} scope="col" className="text-left text-gw-muted py-2.5 px-3 text-xs font-medium whitespace-nowrap uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pagedRows.map((row, ri) => (
              <tr key={ri} className={`border-b border-gw-border/30 transition-colors ${highlightOnHover ? 'hover:bg-gw-surface/40' : ''}`}>
                {showRowNumbers && <td className="text-center text-gw-muted/30 py-2 px-2 text-[10px] font-mono">{startIdx + ri + 1}</td>}
                {row.map((cell, ci) => (
                  <td key={ci} className={`py-2 px-3 whitespace-nowrap ${ci === 0 ? 'text-gw-text font-medium' : ci >= 1 && ci <= 2 ? 'font-mono text-xs text-gw-cyan' : 'text-gw-muted'}`}>
                    {cell ?? '-'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-2 px-1">
          <span className="text-[10px] text-gw-muted/40 font-mono">
            {startIdx + 1}-{Math.min(startIdx + effectivePageSize, rows.length)} / {rows.length}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={safeCurrentPage <= 1}
              className="px-2 py-0.5 rounded text-[10px] text-gw-muted hover:text-gw-text hover:bg-gw-surface/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              上一页
            </button>
            {totalPages <= 7 ? (
              Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setCurrentPage(p)}
                  className={`px-2 py-0.5 rounded text-[10px] transition-colors ${p === safeCurrentPage ? 'bg-gw-blue/20 text-gw-highlight border border-gw-blue/30' : 'text-gw-muted hover:text-gw-text hover:bg-gw-surface/50'}`}>
                  {p}
                </button>
              ))
            ) : (
              <>
                <button onClick={() => setCurrentPage(1)} className={`px-2 py-0.5 rounded text-[10px] transition-colors ${safeCurrentPage === 1 ? 'bg-gw-blue/20 text-gw-highlight' : 'text-gw-muted hover:text-gw-text'}`}>1</button>
                {safeCurrentPage > 3 && <span className="text-[10px] text-gw-muted/30">...</span>}
                {Array.from({ length: 5 }, (_, i) => safeCurrentPage - 2 + i).filter(p => p > 1 && p < totalPages).map(p => (
                  <button key={p} onClick={() => setCurrentPage(p)}
                    className={`px-2 py-0.5 rounded text-[10px] transition-colors ${p === safeCurrentPage ? 'bg-gw-blue/20 text-gw-highlight border border-gw-blue/30' : 'text-gw-muted hover:text-gw-text hover:bg-gw-surface/50'}`}>
                    {p}
                  </button>
                ))}
                {safeCurrentPage < totalPages - 2 && <span className="text-[10px] text-gw-muted/30">...</span>}
                <button onClick={() => setCurrentPage(totalPages)} className={`px-2 py-0.5 rounded text-[10px] transition-colors ${safeCurrentPage === totalPages ? 'bg-gw-blue/20 text-gw-highlight' : 'text-gw-muted hover:text-gw-text'}`}>{totalPages}</button>
              </>
            )}
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={safeCurrentPage >= totalPages}
              className="px-2 py-0.5 rounded text-[10px] text-gw-muted hover:text-gw-text hover:bg-gw-surface/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              下一页
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
