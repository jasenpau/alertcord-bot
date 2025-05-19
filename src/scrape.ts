import 'dotenv/config';
import { scrapeByKeyword } from '@/scrapper/scrapeByKeyword.js';
import { processListing } from '@/scrapper/processListing.js';
import { initializeDatabase, addListings } from '@/data/database.js';
import { filterExistingListings } from '@/scrapper/filterExistingListings.js';

// Initialize database before starting
initializeDatabase();

const results = await scrapeByKeyword('rtx 3080');
const processedResults = await Promise.all(
  results.map(async (result) => {
    return await processListing(result);
  }),
);

// Filter out items that already exist in the database
const newListings = filterExistingListings(processedResults);

// Save only new listings to the database
if (newListings.length > 0) {
  addListings(newListings);
  console.log(
    `Saved ${newListings.length} new listings to the database (${processedResults.length - newListings.length} skipped as duplicates)`,
  );
} else {
  console.log(
    `No new listings to save (all ${processedResults.length} items already exist in the database)`,
  );
}
