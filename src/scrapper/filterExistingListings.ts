import { Listing } from '@/data/models/listing.js';
import { getListingByExternalId } from '@/data/database.js';

export const filterExistingListings = (listings: Omit<Listing, 'id'>[]) => {
  const newListings: Omit<Listing, 'id'>[] = [];

  for (const listing of listings) {
    const existingListing = getListingByExternalId(listing.externalId);
    if (!existingListing) {
      newListings.push(listing);
    }
  }

  return newListings;
};
