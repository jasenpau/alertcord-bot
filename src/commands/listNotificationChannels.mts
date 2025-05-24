import { CommandDefinition } from './types.js';
import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getNotificationChannels } from '@/data/database.js';
import { NotificationChannelType } from '@/data/models/notificationChannel.js';

const listNotificationChannels: CommandDefinition = {
  data: new SlashCommandBuilder()
    .setName('channels')
    .setDescription('Lists active notification channels'),
  execute: async (client, interaction) => {
    const channels = getNotificationChannels();
    if (channels.length === 0) {
      await interaction.reply('No notification channels configured.');
      return;
    }

    const typeLabels = {
      [NotificationChannelType.Normal]: 'Normal and Urgent',
      [NotificationChannelType.UrgentOnly]: 'Urgent Only',
      [NotificationChannelType.NormalOnly]: 'Normal Only',
      [NotificationChannelType.AllEntries]: 'All Entries',
    };

    const embed = new EmbedBuilder()
      .setTitle('Notification Channels')
      .setColor(0x0099ff)
      .setDescription(
        channels
          .map(
            (channel) =>
              `**Channel:** <#${channel.channelId}>\n**Type:** ${typeLabels[channel.type]}\n**ID:** ${channel.id}`,
          )
          .join('\n\n'),
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};

export default listNotificationChannels;
