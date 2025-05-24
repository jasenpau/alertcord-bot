export enum ProcessingResult {
  Success = 1,
  Error = 2,
  NoData = 3,
}

export interface Listing {
  id: number;
  externalId: string;
  title: string;
  price?: number;
  link: string;
  location?: string;
  description?: string;
  fullDescription?: string;
  triggeredKeyword: string;
  imageUrl?: string;
  processedOn?: Date;
  processingResult?: ProcessingResult;
  notified: boolean;
}
