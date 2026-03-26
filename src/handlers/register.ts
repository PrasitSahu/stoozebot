import { Bot } from "grammy";
import { BotCommand } from "grammy/types";
import { BotContext, DB } from "../config";
import { AcceptPrivacyToS, attendanceRegex, CancelPrivacyToS } from "../constants";
import { filterNAuth } from "../middlewares/auth";
import { updateCreds } from "./auth/updateCreds";
import { login } from "./auth/login";
import { getAttendance } from "./commands/attendance/attendance";
import { attendance } from "./commands/attendance/listSem";
import { help } from "./commands/help";
import { start } from "./commands/start";
import { logout } from "./commands/logout";
import { acceptPrivacyToS, cancelPrivacyToS } from "./PToS";

export const enum Commands {
	Start = "start",
	Attendance = "attendance",
	Help = "help",
	Logout = "logout"
}

export const CommandsDesc: Record<Commands, string> = {
	[Commands.Start]: "🚀 Start the bot",
	[Commands.Attendance]: "📋 View your attendance",
	[Commands.Help]: "❓ Get help and usage instructions",
	[Commands.Logout]: "👋 Logout",
};

export function registerCommands(bot: Bot<BotContext>, db: DB) {
	bot.command(Commands.Start, (ctx) => start(ctx, db));
	bot.command(Commands.Help, (ctx) => help(ctx));
	bot.callbackQuery(AcceptPrivacyToS, (ctx) => acceptPrivacyToS(ctx, db));
	bot.callbackQuery(CancelPrivacyToS, (ctx) => cancelPrivacyToS(ctx, db));
 
	bot.use(filterNAuth);
	bot.command(Commands.Logout, (ctx) => logout(ctx, db))
	bot.command(Commands.Attendance, (ctx) => attendance(ctx, db));
	bot.callbackQuery(attendanceRegex, (ctx) => getAttendance(ctx, db));
}

export function registerAuth(bot: Bot<BotContext>, db: DB) {
	login(bot, db);
	updateCreds(bot, db);
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
