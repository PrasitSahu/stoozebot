import { sql } from "drizzle-orm";
import { BotContext, DB } from "../../config";
import { Platform } from "../../constants";
import { platformUsers } from "../../db/schema/platformUsers";
import { text } from "../../utils";

export async function start(ctx: BotContext, db: DB) {
	if (ctx.chat?.type === "private") {
		try {
		await ctx.reply(greet(ctx.chat.first_name), { parse_mode: "Markdown" });
		await db.insert(platformUsers).values({
			platform: Platform.Telegram,
			platformId: ctx.chat.id.toString(),
			reqs: 1,
			lastReqAt: sql`datetime('now')`,
		})
		} catch (error) {
			console.log(error);
		}
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
