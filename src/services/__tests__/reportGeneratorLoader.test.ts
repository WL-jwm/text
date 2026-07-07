/**
 * reportGeneratorLoader.ts 报告加载器单元测试
 * 覆盖：动态加载、预加载、重复加载处理
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  loadReportGenerator,
  preloadCommonReportGenerators,
} from '../reportGeneratorLoader';

describe('loadReportGenerator', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('应成功加载已知报告生成器', async () => {
    // overview 是预注册的基础类型
    await expect(loadReportGenerator('overview')).resolves.not.toThrow();
  });

  it('应支持加载resources报告生成器', async () => {
    await expect(loadReportGenerator('resources')).resolves.not.toThrow();
  });

  it('重复加载不应报错', async () => {
    await loadReportGenerator('overview');
    await expect(loadReportGenerator('overview')).resolves.not.toThrow();
  });
});

describe('preloadCommonReportGenerators', () => {
  it('预加载不应报错', () => {
    expect(() => preloadCommonReportGenerators()).not.toThrow();
  });
});

describe('加载后的报告生成器功能', () => {
  it('加载多个报告生成器不应报错', async () => {
    const types = ['water-quality', 'exploitation', 'environment', 'spatial-analysis', 'time-series'];
    for (const t of types) {
      await expect(loadReportGenerator(t)).resolves.not.toThrow();
    }
  });

  it('重复加载已加载类型不应报错', async () => {
    await loadReportGenerator('overview');
    await expect(loadReportGenerator('overview')).resolves.not.toThrow();
  });
});
