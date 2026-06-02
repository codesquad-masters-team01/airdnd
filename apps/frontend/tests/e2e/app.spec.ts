import { expect, test } from '@playwright/test';

test('숙소 목록에서 상세 화면으로 이동할 수 있다', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: '원하는 숙소를 검색하고 예약하세요.' })).toBeVisible();
  await page.getByRole('link', { name: /성수 루프탑 스테이/ }).click();
  await expect(page.getByRole('heading', { name: '성수 루프탑 스테이' })).toBeVisible();
});

test('검색바에서 가격 범위와 인원을 조정할 수 있다', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('button', { name: '가격 범위' }).click();
  await expect(page.getByText('1박 요금 범위')).toBeVisible();

  const sliderBox = await page.locator('.range-slider').boundingBox();
  expect(sliderBox).not.toBeNull();

  if (!sliderBox) {
    return;
  }

  await page.mouse.click(sliderBox.x + sliderBox.width * 0.45, sliderBox.y + sliderBox.height / 2);

  await page.getByRole('button', { name: '1명' }).click();
  await page.getByRole('button', { name: '아동 증가' }).click();
  await page.getByRole('button', { name: /검색/ }).click();

  await expect(page).toHaveURL(/minPrice=/);
  await expect(page).toHaveURL(/children=1/);
  await expect(page).toHaveURL(/guests=2/);
});

test('인원 필터는 각 항목이 8명에서 증가 버튼이 비활성화된다', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('button', { name: '1명' }).click();
  const increaseButtons = [
    page.getByRole('button', { name: '성인 증가' }),
    page.getByRole('button', { name: '아동 증가' }),
    page.getByRole('button', { name: '유아 증가' }),
  ];

  for (const increaseButton of increaseButtons) {
    for (let count = 0; count < 8; count += 1) {
      if (await increaseButton.isDisabled()) {
        break;
      }

      await increaseButton.click();
    }

    await expect(increaseButton).toBeDisabled();
  }
});

test('호스트 mock 로그인 후 숙소 관리 화면에 접근할 수 있다', async ({ page }) => {
  await page.goto('/login');
  await page.getByRole('button', { name: '호스트로 mock 로그인' }).click();
  await expect(page.getByRole('link', { name: /호스트 사용자/ })).toBeVisible();
  await page.goto('/host/rooms');
  await expect(page.getByRole('heading', { name: '호스트 숙소 관리' })).toBeVisible();
});

test('관리자 mock 로그인 후 누락 페이지에 접근할 수 있다', async ({ page }) => {
  await page.goto('/login');
  await page.getByRole('button', { name: '관리자로 mock 로그인' }).click();
  await expect(page.getByRole('link', { name: /관리자 사용자/ })).toBeVisible();

  await page.goto('/admin/rooms/pending');
  await expect(page.getByRole('heading', { name: '숙소 승인 관리' })).toBeVisible();

  await page.goto('/admin/users');
  await expect(page.getByRole('heading', { name: '사용자 관리' })).toBeVisible();

  await page.goto('/admin/waitlist');
  await expect(page.getByRole('heading', { name: '대기 시스템 상태' })).toBeVisible();
});
