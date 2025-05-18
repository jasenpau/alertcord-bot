import clientReadyEvent from './clientReady.js';
import interactionCreateEvent from './interactionCreate.js';
import { EventHandler } from './types.js';

export const enabledEvents: EventHandler[] = [clientReadyEvent, interactionCreateEvent];
