import {
  getAlertsByKeyword,
  getListingContext,
  getListingsToNotify,
  getNotificationChannels,
  updateListing,
} from '@/data/database.js';
import { NotificationChannelType } from '@/data/models/notificationChannel.js';
import BotClient from '@/extensions/botClient.js';
import { EmbedBuilder } from 'discord.js';
import { Listing } from '@/data/models/listing.js';
import process from 'node:process';
import console from 'node:console';

export const sendListingNotifications = async (client: BotClient) => {
  const listings = getListingsToNotify();
  const channels = getNotificationChannels();
  console.log(channels);

  if (listings.length === 0 || channels.length === 0) {
    return;
  }

  for (let listing of listings) {
    const listingMessage = buildMessage(listing);
    const alerts = getAlertsByKeyword(listing.triggeredKeyword);
    console.log(alerts);

    for (let channel of channels) {
      if (channel.type === NotificationChannelType.AllEntries) {
        console.log('All entries');
        await client.sendMessageToChannel(
          channel.channelId,
          '',
          listingMessage,
        );
      }

      if (
        channel.type === NotificationChannelType.UrgentOnly &&
        alerts.some(
          (a) =>
            listing.price &&
            a.urgentNotifyPrice &&
            listing.price <= a.urgentNotifyPrice,
        )
      ) {
        console.log('Urgent only channel');
        await client.sendMessageToChannel(
          channel.channelId,
          '',
          listingMessage,
        );
      }

      if (
        channel.type === NotificationChannelType.Normal &&
        alerts.some(
          (a) =>
            listing.price && a.notifyPrice && listing.price <= a.notifyPrice,
        )
      ) {
        console.log('Normal channel');
        await client.sendMessageToChannel(
          channel.channelId,
          '',
          listingMessage,
        );
      }
    }

    listing.notified = true;
    updateListing(listing.id, listing);
  }
};

const buildMessage = (listing: Listing) => {
  const listingContext = getListingContext(listing.id);

  const embed = new EmbedBuilder()
    .setTitle(`Listing alert!`)
    .setColor(0x0099ff)
    .setImage(listing.imageUrl ?? null)
    .setURL(`${process.env.WEBSITE_URL}${listing.link}`)
    .setDescription(listing.description ?? null)
    .addFields({
      name: '🔍 Title',
      value: `\`${listing.title}\``,
      inline: false,
    })
    .setTimestamp();

  if (listing.price) {
    embed.addFields({
      name: '💲 Price',
      value: `${listing.price} €`,
      inline: true,
    });
  }

  if (listingContext?.isDesktopComputer) {
    embed.addFields({
      name: 'Type',
      value: `🖥️ Desktop computer`,
      inline: true,
    });
  }

  if (listingContext?.isGpuOnly) {
    embed.addFields({
      name: 'Type',
      value: `💽 GPU`,
      inline: true,
    });
  }

  if (listingContext?.actualGpu) {
    embed.addFields({
      name: 'GPU Model',
      value: `\`${listingContext.actualGpu}\``,
      inline: false,
    });

    if (listingContext?.specs) {
      embed.addFields({
        name: 'Specs',
        value: `\`${listingContext.specs}\``,
        inline: false,
      });
    }
  }

  embed.addFields({
    name: 'Keyword',
    value: `\`${listing.triggeredKeyword}\``,
    inline: false,
  });

  return embed;
};
