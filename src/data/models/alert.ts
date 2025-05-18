export interface Alert {
  id: number;
  name: string;
  keywords: string;
  notify_price: number | null;
  urgent_notify_price: number | null;
}
