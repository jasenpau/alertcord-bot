import { Client, Events } from 'discord.js';
import { EventHandler } from './types.js';
import * as console from 'node:console';
import BotClient from '../extensions/botClient.js';

const clientReadyEvent: EventHandler = {
  name: Events.ClientReady,
  once: true,
  execute: (client: BotClient) => {
    console.log(`Ready! Logged in as ${(client as Client<true>).user.tag}`);
  },
};

export default clientReadyEvent;
