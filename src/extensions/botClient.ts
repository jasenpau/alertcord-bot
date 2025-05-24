import {
  Client,
  ClientOptions,
  Collection,
  EmbedBuilder,
  TextChannel,
} from 'discord.js';
import { CommandDefinition } from '../commands/types.js';
import { EventHandler } from '../events/types.js';
import { sendListingNotifications } from '@/extensions/sendListingNotifications.js';
import ipc from 'node-ipc';

export default class BotClient extends Client {
  public commands?: Collection<string, CommandDefinition>;

  constructor(options: ClientOptions) {
    super(options);
    this.setupIpcServer();
  }

  public loadEvents(events: EventHandler[]) {
    for (const event of events) {
      if (event.once) {
        super.once(event.name, (...args) => event.execute(this, ...args));
      } else {
        this.on(event.name, (...args) => event.execute(this, ...args));
      }
    }
  }

  public async sendNotifications() {
    await sendListingNotifications(this);
  }

  public async sendMessageToChannel(
    channelId: string,
    message: string,
    embeds?: EmbedBuilder,
  ): Promise<void> {
    try {
      const channel = await this.channels.fetch(channelId);
      if (channel && channel.isTextBased()) {
        await (channel as TextChannel).send({
          content: message,
          embeds: embeds ? [embeds] : undefined,
        });
        console.log(`Message sent to channel ${channelId}: ${message}`);
      } else {
        console.error(
          `Channel ${channelId} is not a text-based channel or does not exist.`,
        );
      }
    } catch (error) {
      console.error(`Failed to send message to channel ${channelId}:`, error);
    }
  }

  private setupIpcServer() {
    ipc.config.id = 'alertcord';
    ipc.config.retry = 1500;
    ipc.config.silent = true;

    ipc.serve(() => {
      ipc.server.on('scraping-done', async () => {
        console.log('Received scraping-done message. Sending notifications...');
        await this.sendNotifications();
      });
    });

    ipc.server.start();
  }
}
