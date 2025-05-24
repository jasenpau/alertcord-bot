export interface ScrapedItem {
  externalId: string;
  title: string;
  price?: string;
  link: string;
  description?: string;
  locationField?: string;
  imageUrl?: string;
  triggeredKeyword: string;
}
