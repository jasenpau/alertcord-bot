import { Client, IntentsBitField } from 'discord.js';
import * as process from 'node:process';
import 'dotenv/config';

const clientIntents = new IntentsBitField();
clientIntents.add(
  IntentsBitField.Flags.Guilds,
  IntentsBitField.Flags.GuildMessages,
  IntentsBitField.Flags.MessageContent,
);
const client = new Client({ intents: clientIntents });

client.once('ready', () => {
  console.log(`Logged in as ${client.user?.tag}!`);
});

client.on('messageCreate', (message) => {
  if (message.content === '!ping') {
    message.reply('Pong!');
  }
});

// Add error handling for login
client.login(process.env.DISCORD_TOKEN).catch((error) => {
  console.error('Failed to log in:', error);
});
