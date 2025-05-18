import { CommandDefinition } from './types.js';
import { SlashCommandBuilder } from 'discord.js';
import { deleteAlertByIdOrName } from '@/data/database.js';

const deleteAlert: CommandDefinition = {
  data: new SlashCommandBuilder()
    .setName('deletealert')
    .setDescription('Deletes an alert')
    .addIntegerOption((option) =>
      option
        .setName('id')
        .setDescription('ID of the alert to delete')
        .setRequired(false),
    )
    .addStringOption((option) =>
      option
        .setName('name')
        .setDescription('Name of the alert to delete')
        .setRequired(false),
    ),
  execute: async (client, interaction) => {
    const id = interaction.options.getInteger('id');
    const name = interaction.options.getString('name');

    if (!id && !name) {
      await interaction.reply('You must provide either an ID or a name to delete an alert.');
      return;
    }

    try {
      const deleted = deleteAlertByIdOrName(id, name);
      if (deleted) {
        await interaction.reply(`Alert ${id ? `with ID ${id}` : `named "${name}"`} deleted successfully.`);
      } else {
        await interaction.reply(`No alert found with ${id ? `ID ${id}` : `name "${name}"`}.`);
      }
    } catch (error) {
      console.error('Error deleting alert:', error);
      await interaction.reply('An error occurred while deleting the alert.');
    }
  },
};

export default deleteAlert;
