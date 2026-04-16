import { Composer } from "grammy";
import { BotContext, DB } from "../../config";

export const channelComposer = (db: DB) => {
	const composer = new Composer<BotContext>();

	// Add channel-specific handlers here in the future

	return composer;
};
