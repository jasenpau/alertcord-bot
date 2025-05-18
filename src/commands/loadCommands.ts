import { Collection } from 'discord.js';
import { CommandDefinition } from './types.js';
import listAlerts from './listAlerts.mjs';

const commandDefinitions: CommandDefinition[] = [listAlerts];

const loadCommands = () => {
  const commands = new Collection<string, CommandDefinition>();

  commandDefinitions.forEach((cmd) => {
    commands.set(cmd.data.name, cmd);
  });

  return commands;
};

export default loadCommands;
