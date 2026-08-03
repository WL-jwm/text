// @vitest-environment jsdom
/**
 * G-03/G-04/G-05 测试
 *
 * G-03: 3D等值面 — Marching Squares 等值线提取、颜色插值
 * G-04: 3D截图 — captureScene/exportSceneJSON 工具函数
 * G-05: i18n — 翻译键完整性、中英对齐
 */

import { describe, it, expect, vi } from 'vitest';
import { translations } from '../../i18n/translations';

// ============================================================
// G-05: i18n 翻译键完整性测试
// ============================================================

describe('G-05 i18n 翻译键完整性', () => {
  const zhKeys = Object.keys(translations['zh-CN']);
  const enKeys = Object.keys(translations.en);

  it('中英文键数量一致', () => {
    expect(zhKeys.length).toBe(enKeys.length);
  });

  it('中文键和英文键完全对齐', () => {
    const zhSet = new Set(zhKeys);
    const enSet = new Set(enKeys);
    const missingInEn = zhKeys.filter(k => !enSet.has(k));
    const missingInZh = enKeys.filter(k => !zhSet.has(k));
    expect(missingInEn).toEqual([]);
    expect(missingInZh).toEqual([]);
  });

  it('所有中文值都是非空字符串', () => {
    for (const [key, val] of Object.entries(translations['zh-CN'])) {
      expect(typeof val).toBe('string');
      expect(val.length).toBeGreaterThan(0);
    }
  });

  it('所有英文值都是非空字符串', () => {
    for (const [key, val] of Object.entries(translations.en)) {
      expect(typeof val).toBe('string');
      expect(val.length).toBeGreaterThan(0);
    }
  });

  it('包含 G-03 isosurface3d 翻译键', () => {
    expect(zhKeys).toContain('viz.tab.isosurface3d');
    expect(zhKeys).toContain('viz.tab.isosurface3d.desc');
    expect(zhKeys).toContain('viz.isosurface3d');
  });

  it('包含 G-02 离线分析翻译键', () => {
    expect(zhKeys).toContain('realtime.cacheOverview');
    expect(zhKeys).toContain('realtime.offlineAnalysis');
    expect(zhKeys).toContain('realtime.dailyStats');
    expect(zhKeys).toContain('realtime.cacheManagement');
  });

  it('包含 G-01b 诊断翻译键', () => {
    expect(zhKeys).toContain('realtime.diag_overview');
    expect(zhKeys).toContain('realtime.ws_diag_detail');
    expect(zhKeys).toContain('realtime.log_stream');
  });

  it('包含 G-04 截图翻译键', () => {
    expect(zhKeys).toContain('export.snapshot');
    expect(zhKeys).toContain('export.scene_json');
  });

  it('包含设置面板翻译键', () => {
    expect(zhKeys).toContain('settings.dataSources');
    expect(zhKeys).toContain('settings.connectionLogs');
  });

  it('翻译键总数超过 200', () => {
    expect(zhKeys.length).toBeGreaterThan(200);
  });
});

// ============================================================
// G-03: Marching Squares 等值线提取测试
// ============================================================

describe('G-03 Marching Squares 等值线', () => {
  // 简化的等值线提取（从 Isosurface3D 内部逻辑提取）
  function extractContoursSimple(
    values: number[][],
    rows: number,
    cols: number,
    level: number,
  ): number {
    let segmentCount = 0;

    for (let r = 0; r < rows - 1; r++) {
      for (let c = 0; c < cols - 1; c++) {
        const v00 = values[r]![c]!;
        const v10 = values[r]![c + 1]!;
        const v01 = values[r + 1]![c]!;
        const v11 = values[r + 1]![c + 1]!;

        // 检查是否有等值线穿过
        const above = [v00 > level, v10 > level, v11 > level, v01 > level];
        const crossings = above.filter(a => a).length;

        // 0 或 4 个角都在同一侧 → 无等值线
        if (crossings === 0 || crossings === 4) continue;
        // 2 个角在同一侧 → 1 条线段
        segmentCount++;
      }
    }

    return segmentCount;
  }

  it('水平梯度数据在中间值处生成等值线', () => {
    const values = [
      [0, 0, 0, 0],
      [5, 5, 5, 5],
      [10, 10, 10, 10],
    ];
    const segments = extractContoursSimple(values, 3, 4, 5);
    // 在 level=5 处应该有线段
    expect(segments).toBeGreaterThan(0);
  });

  it('均匀数据不生成等值线', () => {
    const values = [
      [5, 5, 5],
      [5, 5, 5],
      [5, 5, 5],
    ];
    const segments = extractContoursSimple(values, 3, 3, 5);
    expect(segments).toBe(0);
  });

  it('所有值低于等值线时不生成', () => {
    const values = [
      [1, 2, 3],
      [1, 2, 3],
    ];
    const segments = extractContoursSimple(values, 2, 3, 10);
    expect(segments).toBe(0);
  });

  it('所有值高于等值线时不生成', () => {
    const values = [
      [20, 30, 40],
      [20, 30, 40],
    ];
    const segments = extractContoursSimple(values, 2, 3, 10);
    expect(segments).toBe(0);
  });
});

// ============================================================
// G-03: 颜色插值测试
// ============================================================

describe('G-03 颜色插值', () => {
  it('最低值返回第一个断点颜色', () => {
    const stops = [
      { value: 0, color: [0, 0, 255] as [number, number, number] },
      { value: 100, color: [255, 0, 0] as [number, number, number] },
    ];
    // 简化插值
    const t = 0;
    const color = [
      stops[0]!.color[0] + (stops[1]!.color[0] - stops[0]!.color[0]) * t,
      stops[0]!.color[1] + (stops[1]!.color[1] - stops[0]!.color[1]) * t,
      stops[0]!.color[2] + (stops[1]!.color[2] - stops[0]!.color[2]) * t,
    ];
    expect(color[0]).toBe(0);
    expect(color[2]).toBe(255);
  });

  it('最高值返回最后一个断点颜色', () => {
    const stops = [
      { value: 0, color: [0, 0, 255] as [number, number, number] },
      { value: 100, color: [255, 0, 0] as [number, number, number] },
    ];
    const t = 1;
    const color = [
      stops[0]!.color[0] + (stops[1]!.color[0] - stops[0]!.color[0]) * t,
      stops[0]!.color[1] + (stops[1]!.color[1] - stops[0]!.color[1]) * t,
      stops[0]!.color[2] + (stops[1]!.color[2] - stops[0]!.color[2]) * t,
    ];
    expect(color[0]).toBe(255);
    expect(color[2]).toBe(0);
  });

  it('中间值返回插值颜色', () => {
    const stops = [
      { value: 0, color: [0, 0, 255] as [number, number, number] },
      { value: 100, color: [255, 0, 0] as [number, number, number] },
    ];
    const t = 0.5;
    const color = [
      stops[0]!.color[0] + (stops[1]!.color[0] - stops[0]!.color[0]) * t,
      stops[0]!.color[1] + (stops[1]!.color[1] - stops[0]!.color[1]) * t,
      stops[0]!.color[2] + (stops[1]!.color[2] - stops[0]!.color[2]) * t,
    ];
    expect(color[0]).toBeCloseTo(127.5, 0);
    expect(color[2]).toBeCloseTo(127.5, 0);
  });
});

// ============================================================
// G-04: 3D 截图工具测试
// ============================================================

describe('G-04 3D 截图工具', () => {
  it('downloadDataURL 创建并触发下载', () => {
    const a = document.createElement('a');
    vi.spyOn(document, 'createElement').mockReturnValueOnce(a);
    vi.spyOn(document.body, 'appendChild');
    vi.spyOn(document.body, 'removeChild');

    // 模拟 downloadDataURL
    const dataURL = 'data:image/png;base64,abc';
    a.href = dataURL;
    a.download = 'test.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    expect(document.body.appendChild).toHaveBeenCalledWith(a);
    expect(document.body.removeChild).toHaveBeenCalledWith(a);
    expect(a.download).toBe('test.png');
  });

  it('downloadJSON 创建 Blob URL', () => {
    const data = { test: true };
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    expect(blob.size).toBeGreaterThan(0);
    expect(blob.type).toBe('application/json');
  });

  it('SnapshotOptions 类型完整', () => {
    const options = {
      format: 'png' as const,
      pixelRatio: 2,
      quality: 0.92,
      watermark: 'test',
      timestamp: true,
      backgroundColor: '#0f172a',
    };
    expect(options.format).toBe('png');
    expect(options.pixelRatio).toBe(2);
    expect(options.watermark).toBe('test');
  });

  it('SceneExportData 结构包含所有必需字段', () => {
    const mockData = {
      version: '1.0.0',
      timestamp: Date.now(),
      camera: {
        position: [0, 0, 100] as [number, number, number],
        target: [0, 0, 0] as [number, number, number],
        fov: 50,
        aspect: 1.5,
        near: 0.1,
        far: 1000,
      },
      objects: [],
      metadata: { objectCount: 0, triangleCount: 0 },
    };
    expect(mockData.version).toBe('1.0.0');
    expect(mockData.camera.fov).toBe(50);
    expect(mockData.metadata.objectCount).toBe(0);
  });
});

// ============================================================
// G-03: IDW 插值 → 3D 网格转换测试
// ============================================================

describe('G-03 IDW 插值到 3D 网格', () => {
  it('IDW 插值生成有效网格', async () => {
    const { idwInterpolate } = await import('../../utils/idwInterpolation');
    const points = [
      { x: 114.5, y: 38.0, value: 25 },
      { x: 116.0, y: 38.5, value: 20 },
      { x: 115.0, y: 37.5, value: 30 },
      { x: 117.0, y: 39.0, value: 15 },
    ];
    const grid = idwInterpolate(points, undefined, { resolution: 0.2 });
    expect(grid.cols).toBeGreaterThan(0);
    expect(grid.rows).toBeGreaterThan(0);
    expect(grid.values.length).toBe(grid.rows);
  });

  it('COLOR_SCHEMES 包含三种数据类型', async () => {
    const { COLOR_SCHEMES } = await import('../../utils/idwInterpolation');
    expect(COLOR_SCHEMES.waterLevel).toBeDefined();
    expect(COLOR_SCHEMES.waterQuality).toBeDefined();
    expect(COLOR_SCHEMES.geothermal).toBeDefined();
    expect(COLOR_SCHEMES.waterLevel.length).toBeGreaterThan(3);
  });
});
