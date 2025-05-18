import { CommandDefinition } from './types.js';
import { SlashCommandBuilder } from 'discord.js';
import { updateAlert } from '@/data/database.js';
import console from "node:console";

const updateAlertCommand: CommandDefinition = {
  data: new SlashCommandBuilder()
    .setName('updatealert')
    .setDescription('Updates an existing alert')
    .addIntegerOption((option) =>
      option
        .setName('id')
        .setDescription('ID of the alert to update')
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName('name')
        .setDescription('New name for the alert')
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName('keywords')
        .setDescription('New keywords for the alert')
        .setRequired(false)
    )
    .addNumberOption((option) =>
      option
        .setName('notify_price')
        .setDescription('New notify price (use 0 to remove)')
        .setRequired(false)
    )
    .addNumberOption((option) =>
      option
        .setName('urgent_notify_price')
        .setDescription('New urgent notify price (use 0 to remove)')
        .setRequired(false)
    ),
  execute: async (client, interaction) => {
    const id = interaction.options.getInteger('id', true);
    const updates: Record<string, any> = {};

    const name = interaction.options.getString('name');
    const keywords = interaction.options.getString('keywords');
    const notifyPrice = interaction.options.getNumber('notify_price');
    const urgentNotifyPrice = interaction.options.getNumber('urgent_notify_price');

    if (name) updates.name = name;
    if (keywords) updates.keywords = keywords;
    if (notifyPrice !== null) updates.notify_price = notifyPrice === 0 ? null : notifyPrice;
    if (urgentNotifyPrice !== null) updates.urgent_notify_price = urgentNotifyPrice === 0 ? null : urgentNotifyPrice;

    if (Object.keys(updates).length === 0) {
      await interaction.reply('No updates provided. Please specify at least one field to update.');
      return;
    }

    try {
      const success = updateAlert(id, updates);
      if (success) {
        await interaction.reply(`Alert #${id} updated successfully.`);
      } else {
        await interaction.reply(`No alert found with ID ${id}.`);
      }
    } catch (error) {
      console.error('Error updating alert');
      console.error(error);
      await interaction.reply('An error occurred while updating the alert.');
    }
  },
};

export default updateAlertCommand;
