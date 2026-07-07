import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell, Legend } from 'recharts';

import { TechCard, ChartTooltip, SortableTechTable, InfoGrid, CHART_COLORS } from '../UI';
import { Layers } from 'lucide-react';
import type { CityBulletinData, CountyTableRow, CountyUseData, ReservoirData, CountyGroundwaterData } from '../../types/county';

interface BulletinDetailTabProps {
  selectedBulletin: CityBulletinData | null;
  countyTableRows: CountyTableRow[];
  selectedCity: string | null;
  setSelectedCity: (v: string | null) => void;
  countySortCol: number | null;
  countySortDir: 'asc' | 'desc';
  handleCountySort: (col: number) => void;
  bulletinData: CityBulletinData[];
}

export function BulletinDetailTab({
  selectedBulletin, countyTableRows,
  selectedCity, setSelectedCity,
  countySortCol, countySortDir, handleCountySort,
  bulletinData,
}: BulletinDetailTabProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-7 gap-3">
        {bulletinData.map(b => (
          <button
            key={b.city}
            onClick={() => setSelectedCity(selectedCity === b.city ? null : b.city)}
            className={`p-3 rounded-xl border text-center transition-all ${
              selectedCity === b.city
                ? 'bg-gw-blue/15 border-gw-blue/50 text-gw-highlight shadow-[0_0_12px_rgba(59,130,246,0.15)]'
                : 'bg-gw-card/60 border-gw-border/30 text-gw-muted hover:border-gw-border hover:text-gw-text hover:bg-gw-surface/50'
            }`}
          >
            <div className="text-sm font-bold truncate">{b.city.replace('市', '').replace('新区', '')}</div>
            <div className="text-xs mt-1 opacity-70">{b.totalWater}亿m³</div>
            {b.counties && b.counties.length > 0 && (
              <div className="text-[10px] mt-0.5 text-gw-cyan">{b.counties.length}县</div>
            )}
          </button>
        ))}
      </div>

      {selectedBulletin ? (
        <div className="space-y-4">
          <TechCard title={`${selectedBulletin.city} 2024年水资源公报`} badge={selectedBulletin.bulletinDate}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="p-3 bg-gw-card-alt/50 rounded">
                <div className="text-xs text-gw-muted">面积</div>
                <div className="text-lg font-bold text-blue-400">{selectedBulletin.area} km²</div>
              </div>
              <div className="p-3 bg-gw-card-alt/50 rounded">
                <div className="text-xs text-gw-muted">降水量</div>
                <div className="text-lg font-bold text-cyan-400">{selectedBulletin.precipitation} mm</div>
              </div>
              <div className="p-3 bg-gw-card-alt/50 rounded">
                <div className="text-xs text-gw-muted">水资源总量</div>
                <div className="text-lg font-bold text-emerald-400">{selectedBulletin.totalWater} 亿m³</div>
              </div>
              <div className="p-3 bg-gw-card-alt/50 rounded">
                <div className="text-xs text-gw-muted">地下水</div>
                <div className="text-lg font-bold text-green-400">{selectedBulletin.groundWater} 亿m³</div>
              </div>
            </div>

            <InfoGrid
              items={[
                ...(selectedBulletin.multiAvgPrecip ? [{ label: '多年均降水', value: `${selectedBulletin.multiAvgPrecip} mm` }] : []),
                ...(selectedBulletin.multiAvgTotal ? [{ label: '多年均总量', value: `${selectedBulletin.multiAvgTotal} 亿m³` }] : []),
                ...(selectedBulletin.perCapita ? [{ label: '人均水资源', value: `${selectedBulletin.perCapita} m³` }] : []),
                { label: '地表水/地下水/重复量', value: `${selectedBulletin.surfaceWater} / ${selectedBulletin.groundWater} / ${selectedBulletin.repeatCalc} 亿m³` },
                ...(selectedBulletin.coeff ? [{ label: '产水系数', value: `${selectedBulletin.coeff}` }] : []),
                ...(selectedBulletin.totalSupply ? [{ label: '总供水量', value: `${selectedBulletin.totalSupply} 亿m³` }] : []),
                ...(selectedBulletin.localSurfaceSupply ? [{ label: '本地地表水供水', value: `${selectedBulletin.localSurfaceSupply} 亿m³` }] : []),
                ...(selectedBulletin.interBasinTransferSupply ? [{ label: '跨流域调水', value: `${selectedBulletin.interBasinTransferSupply} 亿m³` }] : []),
                ...(selectedBulletin.groundSupply ? [{ label: '地下水供水', value: `${selectedBulletin.groundSupply} 亿m³` }] : []),
                ...(selectedBulletin.otherSupply ? [{ label: '其他供水', value: `${selectedBulletin.otherSupply} 亿m³` }] : []),
                ...(selectedBulletin.southWaterDiversion ? [{ label: '南水北调引江水', value: `${selectedBulletin.southWaterDiversion} 亿m³` }] : []),
                ...(selectedBulletin.agriUse ? [{ label: '农业用水', value: `${selectedBulletin.agriUse} 亿m³` }] : []),
                ...(selectedBulletin.industryUse ? [{ label: '工业用水', value: `${selectedBulletin.industryUse} 亿m³` }] : []),
                ...(selectedBulletin.domesticUse ? [{ label: '生活用水', value: `${selectedBulletin.domesticUse} 亿m³` }] : []),
                ...(selectedBulletin.ecoUse ? [{ label: '生态用水', value: `${selectedBulletin.ecoUse} 亿m³` }] : []),
                ...(selectedBulletin.shallowDepth != null ? [{ label: '平原区浅层平均埋深', value: `${selectedBulletin.shallowDepth} m` }] : []),
                ...(selectedBulletin.shallowChange != null ? [{ label: '浅层水位变化', value: `+${selectedBulletin.shallowChange} m` }] : []),
                ...(selectedBulletin.plainStorageChange != null ? [{ label: '平原地下水蓄变', value: `+${selectedBulletin.plainStorageChange} 亿m³` }] : []),
                ...(selectedBulletin.inflow ? [{ label: '入境水量', value: `${selectedBulletin.inflow} 亿m³` }] : []),
                ...(selectedBulletin.outflow ? [{ label: '出境水量', value: `${selectedBulletin.outflow} 亿m³` }] : []),
                ...(selectedBulletin.reservoirStorage ? [{ label: '水库年末蓄水', value: `${selectedBulletin.reservoirStorage} 亿m³` }] : []),
                ...(selectedBulletin.gdpWaterUse ? [{ label: '万元GDP用水量', value: `${selectedBulletin.gdpWaterUse} m³` }] : []),
                ...(selectedBulletin.industrialWaterUse ? [{ label: '万元工业增加值用水', value: `${selectedBulletin.industrialWaterUse} m³` }] : []),
              ]}
            />

            {selectedBulletin.notes && (
              <div className="mt-3 p-2 bg-blue-900/30 rounded text-xs text-gw-highlight">{selectedBulletin.notes}</div>
            )}
          </TechCard>

          {selectedBulletin.counties && selectedBulletin.counties.length > 0 && (
            <TechCard title={`各县(市/区)水资源量`} badge={`${selectedBulletin.counties.length}个 · 点击表头排序`}>
              <SortableTechTable
                headers={['区县', '降水(mm)', '地表水(亿m³)', '地下水(亿m³)', '总量(亿m³)', '用水合计(亿m³)', '农业(亿m³)', '地下水用水(亿m³)']}
                rows={countyTableRows.map((r: CountyTableRow) => [
                  r.name,
                  r.precip > 0 ? r.precip.toFixed(2) : '-',
                  r.surface > 0 ? r.surface.toFixed(2) : '-',
                  r.ground > 0 ? r.ground.toFixed(2) : '-',
                  r.total > 0 ? r.total.toFixed(2) : '-',
                  r.totalUse > 0 ? r.totalUse.toFixed(4) : '-',
                  r.agri > 0 ? r.agri.toFixed(4) : '-',
                  r.gwUse > 0 ? r.gwUse.toFixed(4) : '-',
                ])}
                sortColumn={countySortCol}
                sortDirection={countySortDir}
                onSort={handleCountySort}
                highlightColumn={countySortCol ?? undefined}
              />
            </TechCard>
          )}

          {selectedBulletin.counties && selectedBulletin.counties.some(c => c.precip != null) && (
            <TechCard title="各县降水量分布" badge="mm">
              <ResponsiveContainer width="100%" height={Math.max(280, countyTableRows.filter((r: CountyTableRow) => r.hasData && r.precip > 0).length * 28 + 40)}>
                <BarChart data={countyTableRows.filter((r: CountyTableRow) => r.hasData && r.precip > 0)} layout="vertical" margin={{ top: 5, right: 20, left: 80, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis type="number" tick={{ fill: '#9ca3af', fontSize: 10 }} label={{ value: 'mm', position: 'insideBottom', fill: '#9ca3af' }} />
                  <YAxis type="category" dataKey="name" tick={{ fill: '#9ca3af', fontSize: 9 }} width={75} />
                  <ChartTooltip unit="mm" />
                  <Bar dataKey="precip" name="降水量(mm)" radius={[0, 4, 4, 0]}>
                    {countyTableRows.filter((r: CountyTableRow) => r.hasData && r.precip > 0).map((_: CountyTableRow, i: number) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} fillOpacity={0.7} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </TechCard>
          )}

          {selectedBulletin.counties && selectedBulletin.counties.some(c => c.agri != null && (c.totalUse ?? 0) > 0) && (() => {
            const useData: CountyUseData[] = selectedBulletin.counties!
              .filter(c => (c.totalUse ?? 0) > 0)
              .map(c => ({
                name: c.name,
                农业: c.agri || 0,
                工业: c.industry || 0,
                生活: c.domestic || 0,
                生态: c.eco || 0,
              }))
              .sort((a: CountyUseData, b: CountyUseData) => (b.农业 + b.工业 + b.生活 + b.生态) - (a.农业 + a.工业 + a.生活 + a.生态));
            return useData.length > 0 ? (
              <TechCard title="各县用水部门结构" badge={`${useData.length}县 · 亿m³`} className="scan-line">
                <div className="flex items-center gap-3 mb-2 text-[10px] text-gw-muted">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm inline-block" style={{backgroundColor:'#10b981'}}></span>农业</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm inline-block" style={{backgroundColor:'#3b82f6'}}></span>工业</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm inline-block" style={{backgroundColor:'#f59e0b'}}></span>生活</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm inline-block" style={{backgroundColor:'#8b5cf6'}}></span>生态</span>
                </div>
                <ResponsiveContainer width="100%" height={Math.max(280, useData.length * 26 + 40)}>
                  <BarChart data={useData} layout="vertical" margin={{ top: 5, right: 20, left: 80, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis type="number" tick={{ fill: '#9ca3af', fontSize: 10 }} />
                    <YAxis type="category" dataKey="name" tick={{ fill: '#9ca3af', fontSize: 9 }} width={75} />
                    <ChartTooltip unit="亿m³" />
                    <Legend wrapperStyle={{ fontSize: 10, color: '#9ca3af' }} />
                    <Bar dataKey="农业" stackId="use" fill="#10b981" fillOpacity={0.85} />
                    <Bar dataKey="工业" stackId="use" fill="#3b82f6" fillOpacity={0.85} />
                    <Bar dataKey="生活" stackId="use" fill="#f59e0b" fillOpacity={0.85} />
                    <Bar dataKey="生态" stackId="use" fill="#8b5cf6" fillOpacity={0.85} radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </TechCard>
            ) : null;
          })()}

          {selectedBulletin.reservoirs && selectedBulletin.reservoirs.length > 0 && (
            <TechCard title={`大中型水库`} badge={`${selectedBulletin.reservoirs.length}座`}>
              <SortableTechTable
                headers={['水库', '类型', '年初蓄水(亿m³)', '年末蓄水(亿m³)', '变化(亿m³)', '入库(亿m³)', '出库(亿m³)']}
                rows={selectedBulletin.reservoirs.map((r: ReservoirData) => [
                  r.name, r.type,
                  r.lastYearStorage?.toFixed(4) ?? '-',
                  r.yearEndStorage?.toFixed(4) ?? '-',
                  r.change?.toFixed(4) ?? '-',
                  r.inflow?.toFixed(4) ?? '-',
                  r.outflow?.toFixed(4) ?? '-',
                ])}
              />
            </TechCard>
          )}

          {selectedBulletin.countyGroundwater && selectedBulletin.countyGroundwater.length > 0 && (
            <TechCard title="各县地下水位埋深变幅" badge={`${selectedBulletin.countyGroundwater.length}县`}>
              <ResponsiveContainer width="100%" height={Math.max(300, selectedBulletin.countyGroundwater.length * 35)}>
                <BarChart data={selectedBulletin.countyGroundwater.map((c: CountyGroundwaterData) => ({name: c.name, 变化: c.change ?? 0}))} layout="vertical" margin={{ top: 5, right: 20, left: 80, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis type="number" tick={{ fill: '#9ca3af' }} label={{ value: 'm', position: 'insideBottom', fill: '#9ca3af' }} />
                  <YAxis type="category" dataKey="name" tick={{ fill: '#9ca3af', fontSize: 10 }} width={75} />
                  <ChartTooltip unit="m" />
                  <Bar dataKey="变化" name="水位变幅(m)" radius={[0, 4, 4, 0]}>
                    {selectedBulletin.countyGroundwater.map((c: CountyGroundwaterData, i: number) => (
                      <Cell key={i} fill={(c.change ?? 0) >= 0 ? '#10b981' : '#ef4444'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </TechCard>
          )}

          {selectedBulletin.supplyByCounty && selectedBulletin.supplyByCounty.length > 0 && (
            <TechCard title="各县供水水源分项" badge={`${selectedBulletin.supplyByCounty.length}县`}>
              <ResponsiveContainer width="100%" height={Math.max(300, selectedBulletin.supplyByCounty.length * 35)}>
                <BarChart data={selectedBulletin.supplyByCounty.map(c => ({name: c.name, 蓄水: c.storageSupply ?? 0, 引水: c.diversionSupply ?? 0, 提水: c.pumpingSupply ?? 0, 地下水: c.groundSupply ?? 0}))} layout="vertical" margin={{ top: 5, right: 20, left: 80, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis type="number" tick={{ fill: '#9ca3af' }} label={{ value: '万m³', position: 'insideBottom', fill: '#9ca3af' }} />
                  <YAxis type="category" dataKey="name" tick={{ fill: '#9ca3af', fontSize: 10 }} width={75} />
                  <ChartTooltip unit="万m³" />
                  <Legend />
                  <Bar dataKey="蓄水" name="蓄水" fill="#3b82f6" stackId="h" />
                  <Bar dataKey="引水" name="引水" fill="#10b981" stackId="h" />
                  <Bar dataKey="提水" name="提水" fill="#f59e0b" stackId="h" />
                  <Bar dataKey="地下水" name="地下水" fill="#06b6d4" stackId="h" />
                </BarChart>
              </ResponsiveContainer>
            </TechCard>
          )}
        </div>
      ) : (
        <div className="text-center py-12 text-gw-muted">
          <Layers size={48} className="mx-auto mb-4 opacity-30" />
          <p className="text-sm">请选择一个城市查看详情</p>
          <p className="text-xs mt-1 opacity-60">已入库县级数据：石家庄(19)、邢台(20)、沧州(16)、承德(11)、保定(19)；骨架待补充：唐山(13)、秦皇岛(7)、邯郸(17)、张家口(16)、廊坊(10)、衡水(11)</p>
        </div>
      )}
    </div>
  );
}
