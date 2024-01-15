import { Page } from 'puppeteer';

export const scrollPageFn = async (timeout: number, page: Page) => {
  const scrollInterval = setInterval(async () => {
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
  }, 1000);

  await new Promise((r) => setTimeout(r, timeout));

  clearInterval(scrollInterval);
};
