import { CommandDefinition } from './types.js';
import { SlashCommandBuilder } from 'discord.js';

const listAlerts: CommandDefinition = {
  data: new SlashCommandBuilder()
    .setName('alerts')
    .setDescription('Lists active alerts'),
  execute: async (client, interaction) => {
    await interaction.reply('Alerts:');
  },
};

export default listAlerts;
