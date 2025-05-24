import { CommandDefinition } from './types.js';
import { SlashCommandBuilder } from 'discord.js';
import { removeNotificationChannel } from '@/data/database.js';

const removeNotificationChannelCmd: CommandDefinition = {
  data: new SlashCommandBuilder()
    .setName('removechannel')
    .setDescription('Removes current channel from notification channels'),
  execute: async (client, interaction) => {
    const channelId = interaction.channelId;

    try {
      const removed = removeNotificationChannel(channelId);
      if (removed) {
        await interaction.reply(
          'Channel successfully removed from notification list.',
        );
      } else {
        await interaction.reply(
          'This channel is not in the notification list.',
        );
      }
    } catch (error) {
      console.error('Error removing notification channel:', error);
      await interaction.reply('An error occurred while removing the channel.');
    }
  },
};

export default removeNotificationChannelCmd;
