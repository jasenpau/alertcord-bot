import { CommandDefinition } from './types.js';
import { SlashCommandBuilder } from 'discord.js';
import { addNotificationChannel } from '@/data/database.js';
import { NotificationChannelType } from '@/data/models/notificationChannel.js';

const addNotificationChannelCmd: CommandDefinition = {
  data: new SlashCommandBuilder()
    .setName('addchannel')
    .setDescription('Adds current channel to notification channels')
    .addIntegerOption((option) =>
      option
        .setName('type')
        .setDescription('Type of notifications for this channel')
        .setRequired(true)
        .addChoices(
          { name: 'Normal', value: NotificationChannelType.Normal },
          { name: 'Urgent Only', value: NotificationChannelType.UrgentOnly },
          { name: 'All Entries', value: NotificationChannelType.AllEntries },
        ),
    ),
  execute: async (client, interaction) => {
    const channelId = interaction.channelId;
    const type = interaction.options.getInteger('type', true);

    try {
      addNotificationChannel({ channelId, type });
      await interaction.reply(
        `Channel successfully added to notification list.`,
      );
    } catch (error) {
      if (error instanceof Error && error.message === 'DUPLICATE_CHANNEL') {
        await interaction.reply(
          'This channel is already in the notification list.',
        );
      } else {
        console.error('Error adding notification channel:', error);
        await interaction.reply('An error occurred while adding the channel.');
      }
    }
  },
};

export default addNotificationChannelCmd;
