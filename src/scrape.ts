import 'dotenv/config';
import { scrapeByKeyword } from '@/scrapper/scrapeByKeyword.js';
import { processListing } from '@/scrapper/processListing.js';
import { initializeDatabase, addListings } from '@/data/database.js';
import { filterExistingListings } from '@/scrapper/filterExistingListings.js';
import { filterByKeywords } from '@/scrapper/filterByKeywords.js';
import ipc from 'node-ipc';

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

  // Notify the bot process via IPC
  ipc.config.id = 'scraper';
  ipc.config.retry = 1500;
  ipc.config.silent = true;

  ipc.connectTo('alertcord', () => {
    ipc.of.alertcord!.on('connect', () => {
      ipc.of.alertcord!.emit('scraping-done');
      console.log('Sent scraping-done message to bot.');
      ipc.disconnect('alertcord');
    });

    ipc.of.alertcord!.on('error', (err) => {
      console.error('Failed to send IPC message:', err);
    });
  });
} else {
  console.log(
    `No new listings to save (all ${processedResults.length} items already exist in the database)`,
  );
}
