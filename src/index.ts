import { IntentsBitField } from 'discord.js';
import loadCommands from './commands/loadCommands.js';
import * as process from 'node:process';
import BotClient from './extensions/botClient.js';
import { enabledEvents } from './events/events.js';
import 'dotenv/config';
import { initializeDatabase } from '@/data/database.js';

const clientIntents = new IntentsBitField([IntentsBitField.Flags.Guilds]);
const client = new BotClient({ intents: clientIntents });

// Initialize SQLite database
initializeDatabase();

client.commands = loadCommands();
client.loadEvents(enabledEvents);
client.login(process.env.DISCORD_TOKEN).catch((error) => {
  console.error('Failed to log in:', error);
});
