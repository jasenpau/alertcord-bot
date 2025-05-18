import { CommandDefinition } from './types.js';
import { SlashCommandBuilder } from 'discord.js';

const listAlerts: CommandDefinition = {
  data: new SlashCommandBuilder()
    .setName('call')
    .addStringOption((opt) => opt.setName('number').setDescription('Phone number to call').setRequired(true))
    .setDescription('Calls specified number and joins the voice chat'),
  execute: async (client, interaction) => {
    await interaction.reply('OK, calling...');
  },
};

export default listAlerts;
