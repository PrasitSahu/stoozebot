import { text } from "./utils";

export const enum Platform {
	Telegram = "telegram",
}

export const ReplyNoAuth = text(`⚠️ Authentication required.
You need to log in before using this command.
Use: \`#login REGNO_PASSWORD\``);
