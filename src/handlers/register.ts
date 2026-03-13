import { Bot } from "grammy";
import { BotContext, DB } from "../config";
import { start } from "./commands/start";
import { login } from "./auth";
import { filterNAuth } from "../middlewares/auth";
import { attendance } from "./commands/attendance/listSem";
import { attendanceRegex } from "../constants";
import { getAttendance } from "./commands/attendance/attendance";

export const enum Commands {
	Start = "start",
	Attendance = "attendance",
}

export function registerCommands(bot: Bot<BotContext>, db: DB) {
	bot.command(Commands.Start, (ctx) => start(ctx, db));

	bot.use(filterNAuth);
	bot.command(Commands.Attendance, (ctx) => attendance(ctx, db));
	bot.callbackQuery(attendanceRegex, (ctx) => getAttendance(ctx, db));
}

export function registerAuth(bot: Bot<BotContext>, db: DB) {
	login(bot, db);
}
