import { Collection } from 'discord.js';
import { CommandDefinition } from './types.js';
import listAlerts from './listAlerts.mjs';
import createAlert from './createAlert.mjs';
import deleteAlert from './deleteAlert.mjs';
import updateAlert from './updateAlert.mjs';

const commandDefinitions: CommandDefinition[] = [
  listAlerts,
  createAlert,
  deleteAlert,
  updateAlert,
];

const loadCommands = () => {
  const commands = new Collection<string, CommandDefinition>();

  commandDefinitions.forEach((cmd) => {
    commands.set(cmd.data.name, cmd);
  });

  return commands;
};

export default loadCommands;
