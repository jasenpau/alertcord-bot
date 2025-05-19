import 'dotenv/config';
import { scrapeByKeyword } from '@/scrapper/scrapeByKeyword.js';
import { processListing } from '@/scrapper/processListing.js';
import { initializeDatabase, addListings } from '@/data/database.js';
import { filterExistingListings } from '@/scrapper/filterExistingListings.js';
import { filterByKeywords } from '@/scrapper/filterByKeywords.js';

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

// Filter out items that contain filtered keywords
const filteredListings = filterByKeywords(newListings);

// Save only new listings to the database
if (filteredListings.length > 0) {
  addListings(filteredListings);
  console.log(
    `Saved ${filteredListings.length} new listings to the database (${processedResults.length - filteredListings.length} skipped)`,
  );
} else {
  console.log(
    `No new listings to save (all ${processedResults.length} items already exist in the database)`,
  );
}
