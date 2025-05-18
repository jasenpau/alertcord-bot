import { CommandDefinition } from './types.js';
import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getAlerts } from '@/data/database.js';

const listAlerts: CommandDefinition = {
  data: new SlashCommandBuilder()
    .setName('alerts')
    .setDescription('Lists active alerts'),
  execute: async (client, interaction) => {
    const alerts = getAlerts();
    if (alerts.length === 0) {
      await interaction.reply('No alerts found.');
      return;
    }

    const embeds = alerts.map(alert => 
      new EmbedBuilder()
        .setTitle(`Alert #${alert.id}: ${alert.name}`)
        .setColor(0x0099FF)
        .addFields(
          { name: '🔍 Keywords', value: `\`${alert.keywords}\``, inline: false },
          { 
            name: '💰 Notify Price', 
            value: `\`${alert.notify_price ?? 'Not set'}\``, 
            inline: true 
          },
          { 
            name: '⚡ Urgent Price', 
            value: `\`${alert.urgent_notify_price ?? 'Not set'}\``, 
            inline: true 
          }
        )
        .setTimestamp()
    );

    await interaction.reply({ 
      content: `📢 Found ${alerts.length} active alert${alerts.length === 1 ? '' : 's'}:`,
      embeds: embeds 
    });
  },
};

export default listAlerts;
