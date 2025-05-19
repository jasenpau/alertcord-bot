import { Listing } from '@/data/models/listing.js';
import { getFilteredKeywords } from '@/data/database.js';

const normalizeText = (text: string): string => {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, ''); // Remove diacritical marks
};

export const filterByKeywords = (
  listings: Omit<Listing, 'id'>[],
): Omit<Listing, 'id'>[] => {
  // Get filtered keywords from database
  const filteredKeywordsEntries = getFilteredKeywords();

  if (!filteredKeywordsEntries || filteredKeywordsEntries.length === 0) {
    return listings; // No filtering needed
  }

  // Extract keyword strings and create normalized versions
  const filteredKeywords = filteredKeywordsEntries.map((entry) => ({
    original: entry.keyword.toLowerCase(),
    normalized: normalizeText(entry.keyword.toLowerCase()),
  }));

  // Return listings that don't match any filtered keyword
  return listings.filter((listing) => {
    if (!listing.title) return true; // Skip if no title

    const titleLower = listing.title.toLowerCase();
    const titleNormalized = normalizeText(titleLower);

    // Check if any filtered keyword is found in the title
    return !filteredKeywords.some(
      (keyword) =>
        titleLower.includes(keyword.original) ||
        titleNormalized.includes(keyword.normalized),
    );
  });
};
