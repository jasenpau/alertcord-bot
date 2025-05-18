import { ChatInputCommandInteraction, SlashCommandBuilder, SlashCommandOptionsOnlyBuilder } from 'discord.js';
import BotClient from '../extensions/botClient.js';

export interface CommandDefinition {
  data: SlashCommandBuilder | SlashCommandOptionsOnlyBuilder;
  execute: (client: BotClient, interaction: ChatInputCommandInteraction) => Promise<void>;
}
