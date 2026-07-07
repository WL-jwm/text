import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { karstBasinStructures } from '../../data/waterSource';
import { TechCard, ChartTooltip } from '../UI';
import { LazyChartCard } from '../LazyChartCard';
import { FilterableTechTable } from '../FilterableTechTable';

interface Props {
  karstAreaData: { name: string; area: number; exposed: string }[];
}

export function WaterSourceKarstTab({ karstAreaData }: Props) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <LazyChartCard title="岩溶盆地面积分布" className="scan-line" height={280}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={karstAreaData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#1a2d4d" />
              <XAxis type="number" stroke="#64748b" fontSize={10} label={{ value: 'km²', position: 'insideBottom', fontSize: 10, fill: '#64748b' }} />
              <YAxis type="category" dataKey="name" stroke="#64748b" fontSize={10} width={65} />
              <Tooltip content={<ChartTooltip unit="km²" title="面积数据" />} />
              <Bar dataKey="area" name="总面积(km²)" fill="#3b82f6" radius={[0, 2, 2, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </LazyChartCard>
        <TechCard title="岩溶盆地蓄水构造特征" badge="碳酸盐岩含水系统">
          <div className="space-y-2">
            <p className="text-xs text-gw-muted"><span className="text-gw-text font-semibold">含水系统：</span>以寒武-奥陶系碳酸盐岩为主体，地下水以层间岩溶和管道流形式赋存运移。泉域边界受断裂和地层界线控制，形成相对独立的水文地质单元。</p>
            <p className="text-xs text-gw-muted"><span className="text-gw-text font-semibold">补给特征：</span>大气降水入渗为主要补给方式，碳酸盐岩裸露区入渗系数可达0.3~0.6。河流渗漏补给在深切河谷段也较为重要。</p>
            <p className="text-xs text-gw-muted"><span className="text-gw-text font-semibold">排泄方式：</span>以大型泉水集中排泄为主要特征。如黑龙洞泉(邯郸，历史流量6~9m³/s)、百泉(邢台)、威州泉等。超采后多数泉水干涸。</p>
          </div>
        </TechCard>
      </div>

      <TechCard title="岩溶盆地蓄水构造明细">
        <FilterableTechTable
          headers={['名称', '面积(km²)', '裸露', '覆盖', '边界条件', '岩性', '含水层', '排泄点']}
          rows={karstBasinStructures.map(s => [s.name, s.area, String(s.exposedArea), String(s.coveredArea), s.boundary, s.lithology, s.aquiferRock, s.discharge])}
          pageSize={10}
          filterPlaceholder="搜索..."
        />
      </TechCard>
    </div>
  );
}
