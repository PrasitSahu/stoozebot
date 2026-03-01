import { Bot } from "grammy";
import { BotContext, DB } from "../config";
import { start } from "./commands/start";

export const enum Commands {
	Start = "start",
}

export function registerCommands(bot: Bot<BotContext>, db: DB) {
	bot.command(Commands.Start, (ctx) => start(ctx, db));
}

export function text(str: string): string {
	return str.trim();
}
