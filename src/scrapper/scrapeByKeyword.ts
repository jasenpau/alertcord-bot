import puppeteer from 'puppeteer';
import * as process from 'node:process';
import { ListingType, OrderBy, UrlBuilder } from '@/scrapper/urlBuilder.js';
import { ScrapedItem } from '@/scrapper/types.js';

export const scrapeByKeyword = async (
  keyword: string,
): Promise<ScrapedItem[]> => {
  const baseUrl = process.env.WEBSITE_URL;
  if (!baseUrl) throw new Error('WEBSITE_URL is not defined');
  const urlBuilder = new UrlBuilder(`${baseUrl}/skelbimai/`)
    .addKeyword(keyword)
    .setOrderBy(OrderBy.UpdatedFirst)
    .setType(ListingType.ForSale);

  const browser = await puppeteer.launch({
    headless: false,
  });
  const page = await browser.newPage();

  try {
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/109.0',
    );
    await page.goto(urlBuilder.build(), { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#searchForm', { timeout: 5_000 });

    const items: ScrapedItem[] = await page.evaluate(() => {
      // @ts-ignore
      const elements = document.querySelectorAll('.standard-list-item');
      const scrapedItems: ScrapedItem[] = [];

      elements.forEach((element) => {
        const externalId = element.getAttribute('data-item-id') || '';
        const title = (
          element.querySelector('.title')?.textContent || ''
        ).trim();
        const description = (
          element.querySelector('.first-dataline')?.textContent || ''
        ).trim();
        const locationField = (
          element.querySelector('.second-dataline')?.textContent || ''
        ).trim();
        const link = element.getAttribute('href') || '';
        const price = (
          element.querySelector('.price')?.textContent || ''
        ).trim();

        scrapedItems.push({
          externalId,
          title,
          description,
          locationField,
          link,
          price,
        });
      });

      return scrapedItems;
    });

    return items;
  } catch (error: any) {
    console.error('Error scraping data:', error);

    // Write error response HTML to a file if available
    // const errorHtml = await page.content();
    // fs.writeFileSync('error_response.html', errorHtml, 'utf-8');

    return [];
  } finally {
    await browser.close();
  }
};
