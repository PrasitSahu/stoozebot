import { Composer } from "grammy";
import { BotContext, DB } from "../../config";

export const groupComposer = (db: DB) => {
	const composer = new Composer<BotContext>();

	// Add group-specific handlers here in the future

	return composer;
};
