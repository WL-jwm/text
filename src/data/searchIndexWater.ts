/**
 * 地下水/水化学术语搜索索引（48 条）
 *
 * 条目按主题拆分至 searchIndexWaterParts/ 子目录，此处聚合。
 */

export interface SearchResult {
  id: string;
  title: string;
  category: string;
  path: string;
  keywords: string;
  snippet?: string;
}

import { searchIndexWaterTerms } from './searchIndexWaterParts/searchIndexWaterterms';
import { searchIndexWaterWater } from './searchIndexWaterParts/searchIndexWaterwater';
import { searchIndexWaterNav } from './searchIndexWaterParts/searchIndexWaternav';

export const searchIndexWater: SearchResult[] = [
  ...searchIndexWaterTerms,
  ...searchIndexWaterWater,
  ...searchIndexWaterNav,
];
