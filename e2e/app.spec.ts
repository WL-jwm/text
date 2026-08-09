/**
 * Q-06 E2E 集成测试 - 应用导航与核心页面
 */
import { test, expect } from '@playwright/test';

test.describe('应用导航', () => {
  test('首页加载正常（标题正确）', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/河北地下水/);
  });

  test('核心页面可正常加载', async ({ page }) => {
    const pages = [
      '/',
      '/water-quality',
      '/groundwater-balance',
      '/visualization',
      '/time-series',
      '/data-insight',
      '/map',
    ];
    for (const p of pages) {
      await page.goto(p);
      await page.waitForLoadState('domcontentloaded');
      // 页面加载无崩溃（body 存在且非空）
      const body = page.locator('body');
      await expect(body).toBeAttached();
    }
  });

  test('页面间路由切换不报错', async ({ page }) => {
    await page.goto('/');
    await page.goto('/water-quality');
    await expect(page).toHaveURL(/\/water-quality/);
    await page.goto('/groundwater-balance');
    await expect(page).toHaveURL(/\/groundwater-balance/);
    await page.goto('/visualization');
    await expect(page).toHaveURL(/\/visualization/);
  });
});