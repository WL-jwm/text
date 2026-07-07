import React from 'react';
import { TechCard, GlobalSearch } from '../UI';
import { FilterableTechTable } from '../FilterableTechTable';

interface Props {
  searchText: string;
  setSearchText: (v: string) => void;
  searchResults: { source: string; key: string; detail: string }[];
}

export function HydroZoneQueryTab({ searchText, setSearchText, searchResults }: Props) {
  return (
    <div className="space-y-4 md:space-y-6">
      <TechCard title="参数查询">
        <div className="mb-4">
          <GlobalSearch placeholder="搜索岩性、含水层、站点..." onSearch={(q) => setSearchText(q)} />
        </div>
        {searchText.trim() && (
          <div className="mt-3">
            <div className="text-xs text-gw-muted mb-2">找到 {searchResults.length} 条结果</div>
            {searchResults.length > 0 ? (
              <FilterableTechTable
                filterPlaceholder="搜索参考数据..."
                headers={['来源', '关键词', '详情']}
                rows={searchResults.map(r => [r.source, r.key, r.detail])}
              />
            ) : (
              <div className="text-center text-gw-muted py-8">无匹配结果</div>
            )}
          </div>
        )}
      </TechCard>
    </div>
  );
}
