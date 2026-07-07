import { useState } from 'react';
import { useReportData } from './useReportData';
import { useToast } from '../components/Toast';

interface PageCommonsConfig {
  pageName: string;
  collector: () => any;
  autoCollect?: boolean;
}

export function usePageCommons(config: PageCommonsConfig) {
  const [exportOpen, setExportOpen] = useState(false);
  const reportData = useReportData({
    pageName: config.pageName,
    collector: config.collector,
    autoCollect: config.autoCollect ?? true,
  });
  const { success, info } = useToast();

  return {
    exportOpen,
    setExportOpen,
    getData: reportData.getData,
    dataLoading: reportData.isLoading,
    success,
    info,
  };
}
