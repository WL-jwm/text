export interface SearchResult {
  id: string;
  title: string;
  category: string;
  path: string;
  keywords: string;
  snippet?: string;
}

// 聚合拆分后的索引模块
import { searchIndexCore } from './searchIndexCore';
import { searchIndexWater } from './searchIndexWater';
import { searchIndexGeo } from './searchIndexGeo';
import { searchIndexEnv } from './searchIndexEnv';
import { searchIndexMap } from './searchIndexMap';

export const searchIndex: SearchResult[] = [
  ...searchIndexCore,
  ...searchIndexWater,
  ...searchIndexGeo,
  ...searchIndexEnv,
  ...searchIndexMap,
];
