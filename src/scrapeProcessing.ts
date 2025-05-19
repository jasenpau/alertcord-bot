import 'dotenv/config';
import { scrapeFullDescription } from '@/scrapper/scrapeFullDescription.js';
import {
  getListingById,
  getUnprocessedListings,
  updateListing,
} from '@/data/database.js';
import { ProcessingResult } from '@/data/models/listing.js';
import { processListingContext } from '@/scrapper/processListingContext.js';
import console from 'node:console';

export const scrapeProcess = async (processingLimit = 10) => {
  const listings = getUnprocessedListings();
  console.log(
    `Listings to process: ${listings.length}. Limited to: ${processingLimit}`,
  );
  let count = 0;

  for (let listing of listings) {
    if (count === processingLimit) {
      console.log('Processing limit reached');
      break;
    }
    count++;

    try {
      await scrapeFullDescription(listing.id);
      listing = getListingById(listing.id)!;

      if (listing.fullDescription) {
        await processListingContext(listing.id);
        listing.processedOn = new Date();
        listing.processingResult = ProcessingResult.Success;
        updateListing(listing.id, listing);
        console.log('Processed listing:', listing.id);
        console.log(`Processed listings: ${count} / ${listings.length}`);
      } else {
        listing.processedOn = new Date();
        listing.processingResult = ProcessingResult.NoData;
        updateListing(listing.id, listing);
      }

      await new Promise((resolve) => {
        setTimeout(() => {
          resolve(true);
        }, 5000);
      });
    } catch (error) {
      console.error(`Error processing listing ${listing.id}:`, error);
      listing.processedOn = new Date();
      listing.processingResult = ProcessingResult.Error;
      updateListing(listing.id, listing);
    }
  }
};

await scrapeProcess();
