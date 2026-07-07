/**
 * 数据质量报告生成器
 * 第25个报告生成器
 * 输出全平台数据扫描结果 + 交叉校验问题汇总
 */

import { registerReportGenerator, buildTable, buildParagraphs, type ReportConfig } from '../reportGenerator';
import { getValidationResult, getModuleScanResult } from '../../data/dataValidation';
import { dataSourceRegistry } from '../../data/dataSourceRegistry';

function generateReport(): ReportConfig {
  const validation = getValidationResult();
  const scanResults = getModuleScanResult();

  const okCount = scanResults.filter(r => r.status === 'ok').length;
  const warnCount = scanResults.filter(r => r.status === 'warning').length;
  const errCount = scanResults.filter(r => r.status === 'error').length;
  const totalRecords = scanResults.reduce((s, r) => s + r.totalRecords, 0);

  const score = scanResults.length > 0
    ? Math.max(0, Math.round((okCount / scanResults.length) * 100 - validation.summary.error * 3))
    : 0;

  const okPct = scanResults.length > 0 ? ((okCount / scanResults.length) * 100).toFixed(1) : '0';
  const warnPct = scanResults.length > 0 ? ((warnCount / scanResults.length) * 100).toFixed(1) : '0';
  const errPct = scanResults.length > 0 ? ((errCount / scanResults.length) * 100).toFixed(1) : '0';
  const scoreDesc = score >= 90 ? '数据质量优良' : score >= 70 ? '数据质量一般' : '需要修复';

  return {
    title: '河北省地下水环境信息平台 · 数据质量报告',
    subtitle: '扫描 ' + scanResults.length + ' 个模块 · ' + totalRecords + ' 条记录 · 综合评分 ' + score + ' 分',
    sections: [
      {
        title: '一、数据质量总览',
        level: 1,
        content: [
          ...buildParagraphs([
            '本报告对河北省地下水环境信息平台的 ' + scanResults.length + ' 个数据模块进行了全面扫描，'
            + '涵盖 ' + totalRecords + ' 条数据记录。'
            + '通过 ' + validation.summary.total + ' 项校验规则进行交叉一致性检查，'
            + '发现 ' + validation.summary.error + ' 个错误、' + validation.summary.warning + ' 个警告、' + validation.summary.info + ' 个信息提示。'
            + '其中 ' + validation.summary.blocking + ' 个问题标记为阻塞发布。',
          ]),
          ...buildTable(
            [
              { header: '指标', width: 4 },
              { header: '数值', width: 3 },
              { header: '说明', width: 9 },
            ],
            [
              ['数据模块总数', scanResults.length + '个', '涵盖A-T共20个数据类别'],
              ['数据记录总数', totalRecords + '条', '所有模块的数组数据记录合计'],
              ['正常模块', okCount + '个', '占比' + okPct + '%'],
              ['警告模块', warnCount + '个', '占比' + warnPct + '%'],
              ['异常模块', errCount + '个', '占比' + errPct + '%'],
              ['校验问题总数', validation.summary.total + '项', '错误' + validation.summary.error + '/警告' + validation.summary.warning + '/信息' + validation.summary.info],
              ['阻塞问题', validation.summary.blocking + '项', '建议在发布前修复'],
              ['综合评分', score + '分', scoreDesc],
            ],
            { caption: '表1 数据质量统计总览' },
          ),
        ],
      },
      {
        title: '二、模块完整性扫描结果',
        level: 1,
        content: [
          ...buildParagraphs([
            '以下为各数据模块的扫描结果，包括记录数量、状态和发现的问题。',
          ]),
          ...buildTable(
            [
              { header: '模块', width: 4 },
              { header: '标签', width: 5 },
              { header: '类别', width: 2 },
              { header: '记录数', width: 1.5 },
              { header: '状态', width: 1.5 },
              { header: '问题数', width: 1.5 },
            ],
            scanResults.map(r => [
              r.module,
              r.label,
              r.category,
              String(r.totalRecords),
              r.status === 'ok' ? '正常' : r.status === 'warning' ? '警告' : '异常',
              String(r.issues.length),
            ]),
            { caption: '表2 数据模块扫描结果' },
          ),
        ],
      },
      {
        title: '三、交叉校验问题详情',
        level: 1,
        content: [
          ...buildParagraphs([
            '共执行 15 项校验规则（4项原始 + 6项v2.0 + 5项v2.1），以下为全部发现问题。',
          ]),
          ...buildTable(
            [
              { header: '序号', width: 1 },
              { header: '级别', width: 1.5 },
              { header: '问题', width: 5 },
              { header: '说明', width: 5 },
              { header: '涉及模块', width: 3 },
              { header: '阻塞', width: 1 },
            ],
            validation.issues.map((issue, i) => [
              String(i + 1),
              issue.level,
              issue.title,
              issue.message,
              issue.affectedModules.join(', '),
              issue.blocking ? '是' : '否',
            ]),
            { caption: '表3 交叉校验问题详情' },
          ),
        ],
      },
      {
        title: '四、数据源注册情况',
        level: 1,
        content: [
          ...buildParagraphs([
            '当前已注册 ' + dataSourceRegistry.length + ' 个数据源模块。',
            '数据源可靠度分布：'
            + '高可靠度 ' + dataSourceRegistry.filter(s => s.reliability === '高').length + ' 个，'
            + '中可靠度 ' + dataSourceRegistry.filter(s => s.reliability === '中').length + ' 个。',
          ]),
          ...buildTable(
            [
              { header: '模块', width: 3 },
              { header: '类别', width: 3 },
              { header: '数据来源', width: 5 },
              { header: '数据年份', width: 2 },
              { header: '更新频率', width: 2 },
              { header: '可靠度', width: 1 },
            ],
            dataSourceRegistry.map(s => [
              s.module,
              s.category,
              s.source,
              s.dataYears,
              s.updateFrequency,
              s.reliability,
            ]),
            { caption: '表4 数据源注册表' },
          ),
        ],
      },
      {
        title: '五、改进建议',
        level: 1,
        content: [
          ...buildParagraphs([
            validation.summary.blocking > 0
              ? '优先修复 ' + validation.summary.blocking + ' 个阻塞问题，确保平台数据发布质量。'
              : '当前无阻塞问题，可正常发布。',
            errCount > 0
              ? '有 ' + errCount + ' 个模块数据存在异常，建议逐个排查并补充缺失数据。'
              : '',
            validation.summary.warning > 5
              ? '警告数量较多（' + validation.summary.warning + '项），建议按模块优先级逐步修复。'
              : '',
            score < 70
              ? '综合评分低于70分，建议进行全面数据清洗和校验。'
              : score < 90
                ? '综合评分在70-90之间，数据质量尚可，建议关注主要问题。'
                : '综合评分90分以上，数据质量优良。',
            '建议定期运行全平台校验，确保数据持续更新和一致性。',
          ].filter(Boolean)),
        ],
      },
    ],
  };
}

registerReportGenerator('dataQuality', generateReport);
