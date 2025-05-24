import { CommandDefinition } from './types.js';
import { SlashCommandBuilder } from 'discord.js';
import { addAlert } from '@/data/database.js';
import console from 'node:console';

const createAlert: CommandDefinition = {
  data: new SlashCommandBuilder()
    .setName('createalert')
    .setDescription('Creates a new alert')
    .addStringOption((option) =>
      option
        .setName('name')
        .setDescription('Name of the alert')
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName('keywords')
        .setDescription('Keywords for the alert')
        .setRequired(true),
    )
    .addNumberOption((option) =>
      option
        .setName('notify_price')
        .setDescription('Notify price (optional)')
        .setRequired(false),
    )
    .addNumberOption((option) =>
      option
        .setName('urgent_notify_price')
        .setDescription('Urgent notify price (optional)')
        .setRequired(false),
    ),
  execute: async (client, interaction) => {
    const name = interaction.options.getString('name', true);
    const keywords = interaction.options.getString('keywords', true);
    const notifyPrice = interaction.options.getNumber('notify_price');
    const urgentNotifyPrice = interaction.options.getNumber(
      'urgent_notify_price',
    );

    try {
      addAlert({
        name,
        keywords: keywords.toLowerCase(),
        notifyPrice: notifyPrice,
        urgentNotifyPrice: urgentNotifyPrice,
      });
      await interaction.reply(`Alert **${name}** created successfully.`);
    } catch (error) {
      if (error instanceof Error && error.message === 'DUPLICATE_ALERT') {
        await interaction.reply(`Alert with name "${name}" already exists.`);
      } else {
        console.error('Error creating alert');
        console.error(error);
        await interaction.reply('An error occurred while creating the alert.');
      }
    }
  },
};

export default createAlert;
