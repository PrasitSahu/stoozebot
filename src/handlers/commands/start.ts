import { BotContext, DB } from "../../config";
import { text } from "../../utils";

export async function start(ctx: BotContext, db: DB) {
	if (ctx.chat?.type === "private") {
		await ctx.reply(greet(ctx.chat.first_name), { parse_mode: "Markdown" });
	}
}

function greet(name: string) {
	// TODO: make a list of features
	return text(
		`
Hello ${name} 👋,
	
*Here's what I can help you with:*

📅 Track attendance - /attendance

For help - /help
		`,
	);
}
