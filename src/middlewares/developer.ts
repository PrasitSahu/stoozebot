import { NextFunction } from "grammy";
import { BotContext, Config } from "@/config";

export default async function (ctx: BotContext, next: NextFunction) {
	const devId = parseInt(process.env.BOT_DEVELOPER);
	const config: Config = {
		botDeveloper: devId,
		isBotDeveloper: ctx.chat?.id === devId,
	};

	ctx.config = config;

	try {
		await next();
	} catch (error) {
		console.error(error);
	}
}
