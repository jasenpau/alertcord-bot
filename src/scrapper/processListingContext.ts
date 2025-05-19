import { addOrUpdateListingContext, getListingById } from '@/data/database.js';
import console from 'node:console';
import OpenAI from 'openai';
import { ListingContext } from '@/data/models/listingContext.js';

export const processListingContext = async (listingId: number) => {
  const listing = getListingById(listingId);
  if (!listing) {
    console.error(`No list found with id ${listingId}`);
    return;
  }

  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const prompt = `
Ar skelbimas parduoda ar superka? isSelling: boolean
Ar parduoda stacionarus kompiuteris? isDesktopComputer: boolean
Ar parduoda tik vaizdo plokštę? isGpuOnly: boolean
Ištrauk parduodama GPU pavadinimą. actualGpu: string
Jei yra kaina, ištrauk ją. price?: number
Išvardink specifikacijas, atskirtas ";". specs?: string
Grąžink TIK JSON su šiais laukais, be papildomos info.
`;

  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'user',
        content:
          prompt +
          `\n\nSkelbimas: ${listing.title}\n\n${listing.fullDescription}`,
      },
    ],
    response_format: { type: 'json_object' },
  });

  const jsonResponse = response?.choices?.[0]?.message.content;
  if (!jsonResponse) {
    console.error('Bad OpenAI response');
    return;
  }

  let parsed: ListingContext;
  try {
    parsed = JSON.parse(jsonResponse);
  } catch (e) {
    console.error('Bad OpenAI JSON:', jsonResponse);
    return;
  }

  parsed.listingId = listingId;
  addOrUpdateListingContext(parsed);
};
