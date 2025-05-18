import axios from 'axios';
import * as cheerio from 'cheerio';
import * as process from 'node:process';
import * as fs from 'fs'; // Import fs module
import { ListingType, OrderBy, UrlBuilder } from '@/scrapper/urlBuilder.js';

interface ScrapedItem {
  externalId: string;
  title: string;
  price?: string;
  link: string;
  description?: string;
  locationField?: string;
}

export async function scrapeByKeyword(keyword: string): Promise<ScrapedItem[]> {
  const baseUrl = process.env.WEBSITE_URL;
  if (!baseUrl) throw new Error('WEBSITE_URL is not defined');
  const urlBuilder = new UrlBuilder(`${baseUrl}/skelbimai/`)
    .addKeyword(keyword)
    .setOrderBy(OrderBy.UpdatedFirst)
    .setType(ListingType.ForSale);

  try {
    const response = await axios.get(urlBuilder.build(), {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/109.0',
      },
    });
    const html = response.data;
    console.log(html);
    const $ = cheerio.load(html);
    const items: ScrapedItem[] = [];

    $('.standard-list-item').each((_, element) => {
      const item: ScrapedItem = {
        externalId: $(element).attr('data-item-id') || '',
        title: $(element).find('.title').text().trim(),
        description: $(element).find('.first-dataline').text().trim(),
        locationField: $(element).find('.second-dataline').text().trim(),
        link: $(element).attr('href') || '',
        price: $(element).find('.price').text().trim(),
      };
      items.push(item);
    });

    return items;
  } catch (error: any) {
    console.error('Error scraping data:', error);

    // Write error response HTML to a file if available
    if (error.response && error.response.data) {
      fs.writeFileSync('error_response.html', error.response.data, 'utf-8');
    }

    return [];
  }
}

