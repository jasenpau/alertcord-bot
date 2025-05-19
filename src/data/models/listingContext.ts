export interface ListingContext {
  listingId: number;
  isSelling: boolean;
  isDesktopComputer: boolean;
  isGpuOnly: boolean;
  actualGpu: string;
  specs?: string;
  price?: number;
}
