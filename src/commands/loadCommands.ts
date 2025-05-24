import { Collection } from 'discord.js';
import { CommandDefinition } from './types.js';
import listAlerts from './listAlerts.mjs';
import createAlert from './createAlert.mjs';
import deleteAlert from './deleteAlert.mjs';
import updateAlert from './updateAlert.mjs';
import listFilteredKeywords from './listFilteredKeywords.mjs';
import addFilteredKeyword from './addFilteredKeyword.mjs';
import deleteFilteredKeyword from './deleteFilteredKeyword.mjs';
import addNotificationChannel from './addNotificationChannel.mjs';
import listNotificationChannels from './listNotificationChannels.mjs';
import removeNotificationChannel from './removeNotificationChannel.mjs';

const commandDefinitions: CommandDefinition[] = [
  listAlerts,
  createAlert,
  deleteAlert,
  updateAlert,
  listFilteredKeywords,
  addFilteredKeyword,
  deleteFilteredKeyword,
  addNotificationChannel,
  listNotificationChannels,
  removeNotificationChannel,
];

const loadCommands = () => {
  const commands = new Collection<string, CommandDefinition>();

  commandDefinitions.forEach((cmd) => {
    commands.set(cmd.data.name, cmd);
  });

  return commands;
};

export default loadCommands;
