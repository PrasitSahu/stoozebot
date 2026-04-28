import { Bot } from "grammy";
import { BotCommand } from "grammy/types";
import { BotContext, DB } from "@/config";
import { privateComposer } from "./private/index";
import { groupComposer } from "./groups/index";
import { channelComposer } from "./channels/index";

export const enum Commands {
	Start = "start",
	Attendance = "attendance",
	Help = "help",
	Logout = "logout",
	Result = "result",
	Timetable = "timetable",
	AdmitCard = "admitcard",
	SecurityMode = "security_mode",
	EnableCMode = "enable_cmode",
	DisableCMode = "disable_cmode",
}

export const CommandsDesc: Record<Commands, string> = {
	[Commands.Start]: "🚀 Start the bot",
	[Commands.Attendance]: "📋 View your attendance",
	[Commands.Result]: "📊 View your SGPA/CGPA",
	[Commands.Timetable]: "🕒 View your Timetable",
	[Commands.AdmitCard]: "🎫 Download your Admit Card",
	[Commands.SecurityMode]: "🛡️ Manage security mode",
	[Commands.EnableCMode]: "🔓 Enable convenience mode",
	[Commands.DisableCMode]: "🔒 Enable privacy mode",
	[Commands.Help]: "❓ Get help and usage instructions",
	[Commands.Logout]: "👋 Logout",
};

export function registerCommands(bot: Bot<BotContext>, db: DB) {
	// Private Chat Layer
	bot.chatType("private").use(privateComposer(db));

	// Group/Supergroup Layer
	bot.chatType(["group", "supergroup"]).use(groupComposer(db));

	// Channel Layer
	bot.chatType("channel").use(channelComposer(db));
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
