import BotClient from '../extensions/botClient.js';

export interface EventHandler {
  name: string;
  once?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  execute: (client: BotClient, ...args: any[]) => void;
}
