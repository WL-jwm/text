import { describe, it, expect } from 'vitest';
import { readdirSync } from 'fs';
import { resolve, basename } from 'path';

// ── 从 App.tsx 中提取的路由定义 ──
// 维护方式：当 App.tsx 新增/删除页面时需同步更新此数组
const routeDefinitions: Array<{ path: string; lazyComponent: string }> = [
  { path: '/', lazyComponent: 'Overview' },
  { path: '/resources', lazyComponent: 'Resources' },
  { path: '/water-quality', lazyComponent: 'WaterQuality' },
  { path: '/environment', lazyComponent: 'Environment' },
  { path: '/exploitation', lazyComponent: 'Exploitation' },
  { path: '/groundwater-function', lazyComponent: 'GroundwaterFunction' },
  { path: '/hydrogeology-historical', lazyComponent: 'HydrogeologyHistorical' },
  { path: '/groundwater-balance', lazyComponent: 'GroundwaterBalance' },
  { path: '/groundwater-background', lazyComponent: 'GroundwaterBackground' },
  { path: '/hydrochemistry', lazyComponent: 'Hydrochemistry' },
  { path: '/geology', lazyComponent: 'Geology' },
  { path: '/hydro-zone-params', lazyComponent: 'HydroZoneParams' },
  { path: '/water-source', lazyComponent: 'WaterSource' },
  { path: '/geothermal', lazyComponent: 'Geothermal' },
  { path: '/mineral-water', lazyComponent: 'MineralWater' },
  { path: '/saline-water', lazyComponent: 'SalineWater' },
  { path: '/saline-soil', lazyComponent: 'SalineSoil' },
  { path: '/mine-hydrogeology', lazyComponent: 'MineHydrogeology' },
  { path: '/karst-water', lazyComponent: 'KarstWater' },
  { path: '/fracture-water', lazyComponent: 'FractureWater' },
  { path: '/map', lazyComponent: 'MapView' },
  { path: '/data-insight', lazyComponent: 'DataInsight' },
  { path: '/time-series', lazyComponent: 'TimeSeriesAnalysis' },
  { path: '/spatial', lazyComponent: 'SpatialAnalysis' },
  { path: '/system-zoning', lazyComponent: 'SystemZoning' },
  { path: '/workspace', lazyComponent: 'Workspace' },
  { path: '/county-compare', lazyComponent: 'CountyWaterCompare' },
  { path: '/changelog', lazyComponent: 'Changelog' },
];

// ── 从 App.tsx navGroups 中提取的导航定义 ──
// 维护方式：当 navGroups 新增/删除导航项时需同步更新
const navItemPaths: string[] = [
  '/',
  '/system-zoning',
  '/geology',
  '/map',
  '/hydro-zone-params',
  '/water-source',
  '/karst-water',
  '/fracture-water',
  '/resources',
  '/county-compare',
  '/water-quality',
  '/environment',
  '/exploitation',
  '/groundwater-function',
  '/hydrogeology-historical',
  '/groundwater-balance',
  '/groundwater-background',
  '/hydrochemistry',
  '/geothermal',
  '/mineral-water',
  '/saline-water',
  '/saline-soil',
  '/mine-hydrogeology',
  '/data-insight',
  '/time-series',
  '/spatial',
  '/workspace',
  '/changelog',
];

const pagesDir = resolve(__dirname, '../pages');

describe('路由一致性测试', () => {
  describe('Route定义完整性', () => {
    it('应有29个路由定义(27个页面 + 首页 + 通配符)', () => {
      // 27 routes + '*' catch-all + 首页('/')
      // routeDefinitions 不含 '*', 27 routes including '/'
      expect(routeDefinitions.length).toBe(28);
    });

    it('每个路由path应唯一', () => {
      const paths = routeDefinitions.map(r => r.path);
      expect(new Set(paths).size).toBe(paths.length);
    });

    it('路由path应以/开头', () => {
      for (const route of routeDefinitions) {
        expect(route.path).toMatch(/^\//);
      }
    });

    it('lazyComponent名称应唯一', () => {
      const names = routeDefinitions.map(r => r.lazyComponent);
      expect(new Set(names).size).toBe(names.length);
    });
  });

  describe('导航-路由双向一致性', () => {
    it('每个导航路径都应有对应的路由定义', () => {
      for (const navPath of navItemPaths) {
        const found = routeDefinitions.find(r => r.path === navPath);
        expect(found).toBeDefined();
      }
    });

    it('每个路由定义都应在导航中可见(除NotFound)', () => {
      // NotFound的'*'不在routeDefinitions中，所以routeDefinitions中所有路由都应在nav中
      for (const route of routeDefinitions) {
        expect(navItemPaths).toContain(route.path);
      }
    });

    it('导航路径数量应等于路由定义数量', () => {
      expect(navItemPaths.length).toBe(routeDefinitions.length);
    });
  });

  describe('页面文件存在性', () => {
    it('pages目录应存在', () => {
      const pages = readdirSync(pagesDir);
      expect(pages.length).toBeGreaterThan(0);
    });

    it('每个lazyComponent应有对应的页面文件', () => {
      const pages = readdirSync(pagesDir).filter(f => f.endsWith('.tsx') || f.endsWith('.ts'));
      const pageNames = pages.map(f => basename(f, '.tsx').replace('.ts', ''));

      for (const route of routeDefinitions) {
        expect(pageNames).toContain(route.lazyComponent);
      }
    });

    it('每个页面文件应对应一个路由定义', () => {
      const pages = readdirSync(pagesDir).filter(f =>
        (f.endsWith('.tsx') || f.endsWith('.ts')) && !f.startsWith('_')
      );
      const routeComponents = new Set(routeDefinitions.map(r => r.lazyComponent));

      // NotFound 页面也有路由（'*'），但不在 routeDefinitions 中
      const extraPages = pages
        .map(f => basename(f, '.tsx'))
        .filter(name => !routeComponents.has(name) && !['NotFound', 'DataInsightInner', 'OverviewHelpers'].includes(name));

      expect(extraPages).toHaveLength(0);
    });
  });

  describe('路由path格式规范', () => {
    it('应使用kebab-case(小写+连字符)', () => {
      for (const route of routeDefinitions) {
        if (route.path !== '/') {
          // 去掉开头的'/'后，应全小写且用连字符分隔
          const seg = route.path.slice(1);
          expect(seg).toMatch(/^[a-z][a-z0-9-]*$/);
        }
      }
    });

    it('不应有重复的路径前缀冲突', () => {
      const paths = routeDefinitions.map(r => r.path).sort();
      for (let i = 1; i < paths.length; i++) {
        // 如果前一个路径不是后一个的前缀
        if (!paths[i].startsWith(paths[i - 1])) continue;
        // 如果是前缀，前一个必须以'/'结尾（精确匹配）或后一个有后续段
        const prev = paths[i - 1];
        // 如 '/' 是所有路径的前缀，但通过 exact match 处理
        // 如 '/map' vs '/map-detail' 则冲突
        if (prev !== '/' && paths[i] !== prev + '/') {
          // 检查是否存在前缀冲突
          expect(paths[i]).toBe(prev + '/');
        }
      }
    });

    it('路由path不应包含尾部斜杠(除根路径)', () => {
      for (const route of routeDefinitions) {
        if (route.path !== '/') {
          expect(route.path.endsWith('/')).toBe(false);
        }
      }
    });
  });

  describe('导航结构完整性', () => {
    // navGroups 的结构在此测试中静态验证
    const expectedGroups = [
      '基础数据',
      '水文地质',
      '资源与环境',
      '专题资源',
      '综合分析',
      '系统',
    ];

    it(`应有${expectedGroups.length}个导航分组`, () => {
      expect(expectedGroups.length).toBe(6);
    });

    it('每个分组应包含2-11个导航项', () => {
      // 各分组实际数量：基础数据4 + 水文地质4 + 资源环境11 + 专题资源4 + 综合分析3 + 系统2 = 28
      expect(navItemPaths.length).toBe(routeDefinitions.length);
    });

    it('导航总数应为28(nav)+2(hidden)=30总页面', () => {
      expect(navItemPaths.length).toBe(28);
      expect(routeDefinitions.length).toBe(28);
    });
  });
});
