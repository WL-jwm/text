/**
 * 水质数据挖掘 (G-06) — 关联规则挖掘算法
 * 拆分自 dataMiningAlgorithms.ts
 */

import type { AssociationRule, WaterQualitySample } from './dataMiningTypes';
import { sampleToTransaction } from './dataMiningUtils';
interface Itemset {
  items: string[];
  count: number;
}

/** 将水质样本离散化为事务项集 */


export function calcAssociationRules(samples: WaterQualitySample[], minSupport = 0.1, minConfidence = 0.5): AssociationRule[] {
  const transactions = samples.map(sampleToTransaction);
  const n = transactions.length;
  const minSupportCount = Math.ceil(minSupport * n);

  // 生成1-项集
  const allItems = new Set<string>();
  transactions.forEach(t => t.forEach(item => allItems.add(item)));

  // 频繁1-项集
  let frequentItemsets: Itemset[] = [];
  const level1: Itemset[] = [];
  for (const item of allItems) {
    const count = transactions.filter(t => t.includes(item)).length;
    if (count >= minSupportCount) {
      level1.push({ items: [item], count });
    }
  }
  frequentItemsets = [...level1];

  // 生成2-项集
  const level2: Itemset[] = [];
  for (let i = 0; i < level1.length; i++) {
    for (let j = i + 1; j < level1.length; j++) {
      const pair = [level1[i].items[0], level1[j].items[0]].sort();
      const count = transactions.filter(t => pair.every(item => t.includes(item))).length;
      if (count >= minSupportCount) {
        level2.push({ items: pair, count });
      }
    }
  }
  frequentItemsets = frequentItemsets.concat(level2);

  // 生成3-项集
  const level3: Itemset[] = [];
  for (let i = 0; i < level2.length; i++) {
    for (let j = i + 1; j < level2.length; j++) {
      const a = level2[i].items;
      const b = level2[j].items;
      // 检查是否可以合并(前n-1项相同)
      if (a[0] === b[0] && a[1] !== b[1]) {
        const triple = [a[0], a[1], b[1]].sort();
        const count = transactions.filter(t => triple.every(item => t.includes(item))).length;
        if (count >= minSupportCount && !level3.some(l => l.items.join(',') === triple.join(','))) {
          level3.push({ items: triple, count });
        }
      }
    }
  }
  frequentItemsets = frequentItemsets.concat(level3);

  // 生成关联规则
  const rules: AssociationRule[] = [];
  for (const itemset of frequentItemsets) {
    if (itemset.items.length < 2) continue;
    const support = itemset.count / n;

    // 生成所有可能的前项→后项
    for (let mask = 1; mask < (1 << itemset.items.length) - 1; mask++) {
      const antecedent: string[] = [];
      const consequent: string[] = [];
      for (let bit = 0; bit < itemset.items.length; bit++) {
        if (mask & (1 << bit)) antecedent.push(itemset.items[bit]);
        else consequent.push(itemset.items[bit]);
      }

      const antecedentCount = transactions.filter(t => antecedent.every(item => t.includes(item))).length;
      if (antecedentCount === 0) continue;

      const confidence = itemset.count / antecedentCount;
      if (confidence < minConfidence) continue;

      // 提升度 = 置信度 / 后项支持度
      const consequentCount = transactions.filter(t => consequent.every(item => t.includes(item))).length;
      const consequentSupport = consequentCount / n;
      const lift = consequentSupport > 0 ? confidence / consequentSupport : 0;

      rules.push({
        antecedent,
        consequent,
        support,
        confidence,
        lift,
        description: `${antecedent.join(' + ')} → ${consequent.join(' + ')}`,
      });
    }
  }

  // 按提升度降序排序
  rules.sort((a, b) => b.lift - a.lift);
  return rules.slice(0, 20);
}
