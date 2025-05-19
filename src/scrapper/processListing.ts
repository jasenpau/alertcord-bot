import { ScrapedItem } from '@/scrapper/types.js';
import { Listing } from '@/data/models/listing.js';

export const processListing = async (item: ScrapedItem) => {
  const location = item.locationField ? item.locationField.split(',')[0] : '';
  const price = item.price
    ? parseInt(item.price.replace(/[€ ]/g, ''))
    : undefined;

  const listing: Omit<Listing, 'id'> = {
    externalId: item.externalId,
    title: item.title,
    price,
    link: item.link,
    location,
    description: item.description,
  };
  return listing;
};
