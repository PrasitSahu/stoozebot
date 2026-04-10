import { Bot } from "grammy";
import { BotCommand } from "grammy/types";
import { BotContext, DB } from "../config";
import { AcceptPrivacyToS, attendanceRegex, CancelPrivacyToS, ResultRegex } from "../constants";
import { filterNAuth } from "../middlewares/auth";
import { login } from "./auth/login";
import { updateCreds } from "./auth/updateCreds";
import { getAttendance } from "./commands/attendance/attendance";
import { attendance } from "./commands/attendance/listSem";
import { help } from "./commands/help";
import { logout } from "./commands/logout";
import { downloadResult } from "./commands/result/downloadResult";
import { result } from "./commands/result/result";
import { start } from "./commands/start";
import { acceptPrivacyToS, cancelPrivacyToS } from "./PToS";

export const enum Commands {
	Start = "start",
	Attendance = "attendance",
	Help = "help",
	Logout = "logout",
	Result = "result",
}

export const CommandsDesc: Record<Commands, string> = {
	[Commands.Start]: "🚀 Start the bot",
	[Commands.Attendance]: "📋 View your attendance",
	[Commands.Result]: "📊 View your SGPA/CGPA",
	[Commands.Help]: "❓ Get help and usage instructions",
	[Commands.Logout]: "👋 Logout",
};

function group(bot: Bot<BotContext>, callback: (bot: Bot<BotContext>) => void) {
	callback(bot);
}

export function registerCommands(bot: Bot<BotContext>, db: DB) {
	bot.command(Commands.Start, (ctx) => start(ctx, db));
	bot.command(Commands.Help, (ctx) => help(ctx));

	group(bot, (bot) => {
		bot.use(filterNAuth);
		bot.command(Commands.Logout, (ctx) => logout(ctx, db));

		// attendance commands
		bot.command(Commands.Attendance, (ctx) => attendance(ctx, db));
		bot.callbackQuery(attendanceRegex, (ctx) => getAttendance(ctx, db));

		// result commands
		bot.command(Commands.Result, (ctx) => result(ctx, db));
		bot.callbackQuery(ResultRegex, (ctx) => downloadResult(ctx, db));
	});
	bot.callbackQuery("#cancel", cancelHandler);

	bot.callbackQuery(AcceptPrivacyToS, (ctx) => acceptPrivacyToS(ctx, db));
	bot.callbackQuery(CancelPrivacyToS, (ctx) => cancelPrivacyToS(ctx, db));
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

async function cancelHandler(ctx: BotContext) {
	try {
		await ctx.deleteMessage();
	} catch (error) {}
}
