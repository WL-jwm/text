/**
 * 拆分自 WellNetworkPanel.tsx
 */


export function StatusHints({ reportStatus, reportMsg, exportStatus }: { reportStatus: 'idle' | 'generating' | 'done' | 'error'; reportMsg: string; exportStatus: 'idle' | 'exporting' | 'done' }) {
  return (
    <>
    {/* 报告/导出状态提示 */}
    {reportStatus !== 'idle' && (
      <div className={`text-[9px] px-2 py-1 rounded ${reportStatus === 'done' ? 'bg-emerald-500/10 text-emerald-400' : reportStatus === 'error' ? 'bg-red-500/10 text-red-400' : 'bg-gw-cyan/10 text-gw-cyan'}`}>
        {reportMsg}
      </div>
    )}
    {exportStatus === 'done' && (
      <div className="text-[9px] px-2 py-1 rounded bg-emerald-500/10 text-emerald-400">
        数据导出成功
      </div>
    )}
    </>
  );
}
