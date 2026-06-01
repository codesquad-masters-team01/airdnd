import { expect, test } from '@playwright/test';

test('숙소 목록에서 상세 화면으로 이동할 수 있다', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: '원하는 숙소를 검색하고 예약하세요.' })).toBeVisible();
  await page.getByRole('link', { name: /성수 루프탑 스테이/ }).click();
  await expect(page.getByRole('heading', { name: '성수 루프탑 스테이' })).toBeVisible();
});

test('호스트 mock 로그인 후 숙소 관리 화면에 접근할 수 있다', async ({ page }) => {
  await page.goto('/login');
  await page.getByRole('button', { name: '호스트로 mock 로그인' }).click();
  await expect(page.getByRole('link', { name: /호스트 사용자/ })).toBeVisible();
  await page.goto('/host/rooms');
  await expect(page.getByRole('heading', { name: '호스트 숙소 관리' })).toBeVisible();
});
