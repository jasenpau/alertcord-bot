import { Events, Interaction } from 'discord.js';
import BotClient from '../extensions/botClient.js';
import { EventHandler } from './types.js';
import console from 'node:console';

type InteractionCreateEventExecute = (client: BotClient, interaction: Interaction) => Promise<void>;

const onInteractionCreate: InteractionCreateEventExecute = async (client, interaction) => {
  if (!interaction.isChatInputCommand()) return;
  const cmd = client.commands?.get(interaction.commandName);
  if (!cmd) return;

  try {
    await cmd.execute(client, interaction);
  } catch (error) {
    console.error(error);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
    } else {
      await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
  }
};

const interactionCreateEvent: EventHandler = {
  name: Events.InteractionCreate,
  execute: onInteractionCreate,
};

export default interactionCreateEvent;
