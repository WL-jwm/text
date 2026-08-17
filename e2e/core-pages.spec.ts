/**
 * E-04 E2E 集成测试 - 核心页面交互冒烟
 *
 * 在 Q-06 基础（页面加载/路由）之上，增加对核心业务页面的交互冒烟：
 * 水质评价、地下水均衡、可视化中心（Piper）、工作台（数据导入）。
 * 以"tab 切换/面板可用后页面不崩溃"为验收标准，避免耦合具体数据细节。
 */
import { test, expect } from '@playwright/test';

test.describe('核心页面交互冒烟（E-04）', () => {
  test('水质评价：指标 tab 切换不崩溃', async ({ page }) => {
    await page.goto('/water-quality');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('body')).toBeAttached();

    // 依次切换「污染程度」「工业用水」两个 tab
    await page.getByRole('button', { name: /污染程度/ }).click();
    await expect(page.locator('body')).toBeAttached();
    await page.getByRole('button', { name: /工业用水/ }).click();
    await expect(page.locator('body')).toBeAttached();
  });

  test('地下水均衡：分析 tab 切换不崩溃', async ({ page }) => {
    await page.goto('/groundwater-balance');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('body')).toBeAttached();

    // 「均衡计算」「各市均衡」两个 tab
    await page.getByRole('button', { name: /均衡计算/ }).click();
    await expect(page.locator('body')).toBeAttached();
    await page.getByRole('button', { name: /各市均衡/ }).click();
    await expect(page.locator('body')).toBeAttached();
  });

  test('可视化中心：Piper 三线图渲染不崩溃', async ({ page }) => {
    await page.goto('/visualization');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('body')).toBeAttached();

    // 切到 Piper 三线图 tab
    await page.getByRole('button', { name: /Piper三线图/ }).click();
    await expect(page.locator('body')).toBeAttached();
  });

  test('工作台：数据导入面板可用', async ({ page }) => {
    await page.goto('/workspace');
    await page.waitForLoadState('domcontentloaded');
    // 工作台默认展示数据导入面板，应出现「解析格式」等入口
    await expect(page.getByText('解析格式')).toBeAttached();
  });
});
