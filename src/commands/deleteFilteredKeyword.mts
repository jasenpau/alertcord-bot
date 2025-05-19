import { CommandDefinition } from './types.js';
import { SlashCommandBuilder } from 'discord.js';
import { deleteFilteredKeywordByName } from '@/data/database.js';

const deleteFilteredKeyword: CommandDefinition = {
  data: new SlashCommandBuilder()
    .setName('deletefilteredkeyword')
    .setDescription('Deletes a filtered keyword by name')
    .addStringOption((option) =>
      option
        .setName('keyword')
        .setDescription('Keyword to delete')
        .setRequired(true),
    ),
  execute: async (client, interaction) => {
    const keyword = interaction.options.getString('keyword', true);

    try {
      const deleted = deleteFilteredKeywordByName(keyword);
      if (deleted) {
        await interaction.reply(`Filtered keyword **${keyword}** deleted successfully.`);
      } else {
        await interaction.reply(`No filtered keyword found with name "${keyword}".`);
      }
    } catch (error) {
      console.error('Error deleting filtered keyword:', error);
      await interaction.reply('An error occurred while deleting the filtered keyword.');
    }
  },
};

export default deleteFilteredKeyword;
