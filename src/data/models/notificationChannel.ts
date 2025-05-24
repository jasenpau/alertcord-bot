export enum NotificationChannelType {
  Normal = 1,
  UrgentOnly = 2,
  AllEntries = 3,
}

export interface NotificationChannel {
  id: number;
  channelId: string;
  type: NotificationChannelType;
}
