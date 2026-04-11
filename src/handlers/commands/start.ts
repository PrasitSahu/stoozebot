import { InlineKeyboard } from "grammy";
import { BotContext, DB } from "../../config";
import { NewsChannel } from "../../constants";
import { text } from "../../utils";

export async function start(ctx: BotContext, db: DB) {
	if (ctx.chat?.type === "private") {
		try {
			let isSubscribed = false;
			try {
				const member = await ctx.api.getChatMember(NewsChannel, ctx.from!.id);
				isSubscribed = ["member", "administrator", "creator"].includes(member.status);
			} catch (err) {
				isSubscribed = false;
			}

			if (isSubscribed) {
				await ctx.reply(
					`${greet(ctx.chat.first_name)}\n\nJoin our channel to stay updated with the latest features and news about the bot! 📢`,
					{
						reply_markup: new InlineKeyboard().url("Join Channel", `https://t.me/stoozenews`),
						parse_mode: "Markdown",
					},
				);
				return;
			}

			await ctx.reply(greet(ctx.chat.first_name), { parse_mode: "Markdown" });
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
🎓 Check results - /result
🎫 Download admit card - /admitcard

For help - /help
		`,
	);
}
