import { Bot } from "grammy";
import { BotContext, DB } from "../config";
import { start } from "./commands/start";
import { login } from "./auth";
import { filterNAuth } from "../middlewares/auth";
import { attendance } from "./commands/attendance/listSem";
import { attendanceRegex } from "../constants";
import { getAttendance } from "./commands/attendance/attendance";
import { help } from "./commands/help";
import { BotCommand } from "grammy/types";

export const enum Commands {
	Start = "start",
	Attendance = "attendance",
	Help = "help",
}

export const CommandsDesc: Record<Commands, string> = {
	[Commands.Start]: "🚀 Start the bot",
	[Commands.Attendance]: "📋 View your attendance",
	[Commands.Help]: "❓ Get help and usage instructions",
};

export function registerCommands(bot: Bot<BotContext>, db: DB) {
	bot.command(Commands.Start, (ctx) => start(ctx, db));
	bot.command(Commands.Help, (ctx) => help(ctx));

	bot.use(filterNAuth);
	bot.command(Commands.Attendance, (ctx) => attendance(ctx, db));
	bot.callbackQuery(attendanceRegex, (ctx) => getAttendance(ctx, db));
}

export function registerAuth(bot: Bot<BotContext>, db: DB) {
	login(bot, db);
}

export async function setCommandList(bot: Bot<BotContext>) {
	const commands: BotCommand[] = Object.entries(CommandsDesc).map(([command, description]) => ({
		command,
		description,
	}));

	try {
		await bot.api.setMyCommands(commands);
	} catch (error) {}
}
