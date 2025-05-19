export interface Listing {
  id: number;
  externalId: string;
  title: string;
  price?: number;
  link: string;
  location?: string;
  description?: string;
  processedOn?: Date;
}
