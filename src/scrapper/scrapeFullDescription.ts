import { getListingById, updateListing } from '@/data/database.js';
import console from 'node:console';
import process from 'node:process';
import puppeteer from 'puppeteer';

export const scrapeFullDescription = async (listingId: number) => {
  const listing = getListingById(listingId);
  if (!listing) {
    console.error(`No list found with id ${listingId}`);
    return;
  }

  const baseUrl = process.env.WEBSITE_URL;
  if (!baseUrl) throw new Error('WEBSITE_URL is not defined');

  const browser = await puppeteer.launch({
    headless: false,
  });
  const page = await browser.newPage();

  try {
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/109.0',
    );
    await page.goto(`${baseUrl}${listing.link}`, {
      waitUntil: 'domcontentloaded',
    });
    await page.waitForSelector('#searchForm', { timeout: 5_000 });

    const fullDescription = await page.evaluate(() => {
      // @ts-ignore
      const elements = document.querySelectorAll('.description');
      if (elements.length === 0) {
        return null;
      }

      let description = '';

      elements.forEach((element) => {
        const text = element.textContent || '';
        description += text.trim();
      });

      description = description
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/\n{2,}/g, '\n');
      return description;
    });

    console.log('F:', fullDescription);

    if (fullDescription) {
      listing.fullDescription = fullDescription;
      updateListing(listingId, listing);
    }
  } catch (error: any) {
    console.error('Error scraping data:', error);

    // Write error response HTML to a file if available
    // const errorHtml = await page.content();
    // fs.writeFileSync('error_response.html', errorHtml, 'utf-8');

    return;
  } finally {
    await browser.close();
  }
};
