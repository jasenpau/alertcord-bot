export interface Alert {
  id: number;
  name: string;
  keywords: string;
  notifyPrice: number | null;
  urgentNotifyPrice: number | null;
}
