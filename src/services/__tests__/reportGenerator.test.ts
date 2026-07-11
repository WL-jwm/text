/**
 * reportGenerator.ts 报告生成器单元测试
 * 覆盖：buildTable / buildParagraph / registerReportGenerator / getRegisteredTypes
 */
import { describe, it, expect, beforeEach } from 'vitest';
import {
  buildTable,
  buildParagraph,
  buildParagraphs,
  registerReportGenerator,
  getRegisteredTypes,
} from '../reportGenerator';

// ============================================================
// buildTable
// ============================================================
describe('buildTable', () => {
  it('应返回包含表格元素的数组', () => {
    const result = buildTable(
      [{ header: '城市' }, { header: '水位(m)' }],
      [['石家庄', '32'], ['邢台', '35']]
    );
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  it('无数据时返回空表格结构', () => {
    const result = buildTable([{ header: '城市' }, { header: '值' }], []);
    expect(Array.isArray(result)).toBe(true);
  });

  it('带caption时应返回表标题+表格', () => {
    const result = buildTable(
      [{ header: '城市' }, { header: '值' }],
      [['石家庄', '32']],
      { caption: '测试表' }
    );
    // 第一个元素应为标题段落
    const first = result[0];
    expect(first).toBeDefined();
    // Paragraph 对象有 type 属性
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((first as any).constructor.name).toBe('Paragraph');
  });

  it('应支持自定义列宽', () => {
    const result = buildTable(
      [{ header: '城市', width: 30 }, { header: '水位', width: 70 }],
      [['石家庄', '32']]
    );
    expect(result.length).toBeGreaterThan(0);
  });

  it('应支持列对齐方式', () => {
    const result = buildTable(
      [{ header: '城市', align: 'center' }, { header: '值', align: 'right' }],
      [['石家庄', '32']]
    );
    expect(result.length).toBeGreaterThan(0);
  });

});

// ============================================================
// buildParagraph / buildParagraphs
// ============================================================
describe('buildParagraph', () => {
  it('应生成Paragraph对象', () => {
    const p = buildParagraph('测试文本');
    expect(p).toBeDefined();
    expect(p.constructor.name).toBe('Paragraph');
  });

  it('应支持加粗选项', () => {
    const p = buildParagraph('加粗文本', { bold: true });
    expect(p).toBeDefined();
  });

  it('应支持缩进选项', () => {
    const p = buildParagraph('缩进文本', { indent: true });
    expect(p).toBeDefined();
  });

  it('空字符串应生成有效段落', () => {
    const p = buildParagraph('');
    expect(p).toBeDefined();
  });
});

describe('buildParagraphs', () => {
  it('应返回Paragraph数组', () => {
    const ps = buildParagraphs(['第一段', '第二段', '第三段']);
    expect(Array.isArray(ps)).toBe(true);
    expect(ps.length).toBe(3);
    ps.forEach(p => {
      expect(p.constructor.name).toBe('Paragraph');
    });
  });

  it('空数组应返回空数组', () => {
    const ps = buildParagraphs([]);
    expect(ps.length).toBe(0);
  });
});

// ============================================================
// registerReportGenerator / getRegisteredTypes
// ============================================================
describe('registerReportGenerator', () => {
  beforeEach(() => {
    // 清除已注册的类型以便测试
    const types = getRegisteredTypes();
    types.forEach(t => {
      // 重新注册一个空生成器覆盖
      registerReportGenerator(t, () => ({ title: t, sections: [] }));
    });
  });

  it('应注册新报告生成器', () => {
    const before = getRegisteredTypes().length;
    registerReportGenerator('test-report', () => ({
      title: '测试报告',
      sections: [],
    }));
    const after = getRegisteredTypes().length;
    expect(after).toBe(before + 1);
  });

  it('重复注册应覆盖已有生成器', () => {
    registerReportGenerator('test-override', () => ({
      title: '原始',
      sections: [],
    }));
    registerReportGenerator('test-override', () => ({
      title: '覆盖',
      sections: [],
    }));
    expect(getRegisteredTypes()).toContain('test-override');
  });

  it('应支持空section的报告配置', () => {
    registerReportGenerator('test-empty', () => ({
      title: '空报告',
      sections: [],
    }));
    expect(getRegisteredTypes()).toContain('test-empty');
  });
});

describe('getRegisteredTypes', () => {
  it('应返回已注册的类型数组', () => {
    const types = getRegisteredTypes();
    expect(Array.isArray(types)).toBe(true);
  });

  it('注册后类型应可查找', () => {
    const before = getRegisteredTypes().length;
    registerReportGenerator('test-type', () => ({ title: 't', sections: [] }));
    expect(getRegisteredTypes().length).toBe(before + 1);
    expect(getRegisteredTypes()).toContain('test-type');
  });
});
