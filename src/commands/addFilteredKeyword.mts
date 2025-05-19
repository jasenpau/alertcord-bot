import { CommandDefinition } from './types.js';
import { SlashCommandBuilder } from 'discord.js';
import { addFilteredKeywords } from '@/data/database.js';

const addFilteredKeyword: CommandDefinition = {
  data: new SlashCommandBuilder()
    .setName('addfilteredkeyword')
    .setDescription('Adds one or more filtered keywords (comma separated)')
    .addStringOption((option) =>
      option
        .setName('keywords')
        .setDescription('Keyword(s) to filter (separate multiple with commas)')
        .setRequired(true),
    ),
  execute: async (client, interaction) => {
    const keywordsInput = interaction.options.getString('keywords', true);
    const keywordsArray = keywordsInput.split(',').map(k => k.trim()).filter(k => k.length > 0);
    
    if (keywordsArray.length === 0) {
      await interaction.reply('Please provide at least one valid keyword.');
      return;
    }

    try {
      const { added } = addFilteredKeywords(keywordsArray);
      
      if (added === 0) {
        await interaction.reply('No new keywords were added. They might already exist in the database.');
      } else if (keywordsArray.length === 1) {
        await interaction.reply(`Keyword **${keywordsArray[0]}** has been added to filtered keywords.`);
      } else {
        await interaction.reply(`${added} out of ${keywordsArray.length} keywords have been added to filtered keywords.`);
      }
    } catch (error) {
      console.error('Error adding filtered keyword(s):', error);
      await interaction.reply('An error occurred while adding filtered keyword(s).');
    }
  },
};

export default addFilteredKeyword;
