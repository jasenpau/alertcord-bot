import { Client, ClientOptions, Collection } from 'discord.js';
import { CommandDefinition } from '../commands/types.js';
import { EventHandler } from '../events/types.js';

export default class BotClient extends Client {
  public commands?: Collection<string, CommandDefinition>;

  constructor(options: ClientOptions) {
    super(options);
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
}
