import { CommandDefinition } from './types.js';
import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getFilteredKeywords } from '@/data/database.js';

const listFilteredKeywords: CommandDefinition = {
  data: new SlashCommandBuilder()
    .setName('filteredkeywords')
    .setDescription('Lists all filtered keywords'),
  execute: async (client, interaction) => {
    try {
      const keywords = getFilteredKeywords();

      if (keywords.length === 0) {
        await interaction.reply('No filtered keywords found.');
        return;
      }

      // Format keywords as a nicely formatted list
      const keywordsList = keywords
        .map((entry) => `• ${entry.keyword}`)
        .join('\n');

      const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle('Filtered Keywords')
        .setDescription(
          `These keywords are being filtered from alerts:\n\n${keywordsList}`,
        )
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Error listing filtered keywords:', error);
      await interaction.reply(
        'An error occurred while listing filtered keywords.',
      );
    }
  },
};

export default listFilteredKeywords;
