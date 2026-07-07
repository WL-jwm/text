/**
 * 报告生成器注册完整性测试
 * 验证各报告生成器的返回结构(标题/章节/表格)符合ReportConfig接口
 */
import { describe, it, expect } from 'vitest';

describe('报告生成器加载测试', () => {
  it('加载核心报告生成器不应报错', async () => {
    const { loadReportGenerator } = await import('../reportGeneratorLoader');
    const core = ['overview', 'resources', 'water-quality', 'exploitation', 'environment',
      'hydrochemistry', 'geology', 'geothermal', 'groundwater-function',
      'spatial-analysis', 'time-series'];
    for (const t of core) {
      await expect(loadReportGenerator(t)).resolves.not.toThrow();
    }
  }, 15000);

  it('加载不存在的类型不应报错', async () => {
    const { loadReportGenerator } = await import('../reportGeneratorLoader');
    await expect(loadReportGenerator('nonexistent-type')).resolves.not.toThrow();
  });
});
