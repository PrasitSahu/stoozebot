import { Bot } from "grammy";
import { BotContext, DB } from "../config";
import { start } from "./commands/start";
import { login } from "./auth";
import { filterNAuth } from "../middlewares/auth";
import { attendence } from "./commands/attendence/listSem";
import { attendenceRegex } from "../constants";
import { getAttendence } from "./commands/attendence/attendence";

export const enum Commands {
	Start = "start",
	Attendence = "attendence",
}

export function registerCommands(bot: Bot<BotContext>, db: DB) {
	bot.command(Commands.Start, (ctx) => start(ctx, db));

	bot.use(filterNAuth);
	bot.command(Commands.Attendence, (ctx) => attendence(ctx, db));
	bot.hears(attendenceRegex, (ctx) => getAttendence(ctx, db));
}

export function registerAuth(bot: Bot<BotContext>, db: DB) {
	login(bot, db);
}
