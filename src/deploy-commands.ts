import loadCommands from './commands/loadCommands.js';
import * as process from 'node:process';
import { REST } from 'discord.js';
import 'dotenv/config';
import { Routes } from 'discord-api-types/rest/v10';

const commands = loadCommands();

const throwError = (error: string) => {
  throw new Error(error);
};

const token = process.env['DISCORD_TOKEN'] ?? throwError('Discord token not defined');
const appId = process.env['APP_ID'] ?? throwError('Application ID not defined');
const devGuildId = process.env['DEV_GUILD_ID'] ?? throwError('Development Guild ID not defined');

interface DiscordApiResponse {
  length: number;
}

const rest = new REST().setToken(token);
(async () => {
  try {
    console.log(`Started refreshing ${commands.size} application (/) commands.`);

    const requestBody = commands.map((x) => x.data.toJSON());

    // The put method is used to fully refresh all commands in the guild with the current set
    const data = (await rest.put(Routes.applicationGuildCommands(appId, devGuildId), {
      body: requestBody,
    })) as DiscordApiResponse;

    console.log(`Successfully reloaded ${data.length} application (/) commands.`);
  } catch (error) {
    // And of course, make sure you catch and log any errors!
    console.error(error);
  }
})();
