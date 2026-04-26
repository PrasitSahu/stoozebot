import { InlineKeyboard } from "grammy";
import { BotContext, DB } from "@/config";
import { NewsChannel, privacyTOSKeyboard } from "@/constants";
import { text } from "@/utils";

export async function start(ctx: BotContext, db: DB) {
	if (ctx.chat?.type === "private") {
		try {
			let isSubscribed = false;
			if (NewsChannel) {
				try {
					const member = await ctx.api.getChatMember(NewsChannel, ctx.from!.id);
					isSubscribed = ["member", "administrator", "creator"].includes(member.status);
				} catch (err) {
					isSubscribed = false;
				}
			} else {
				isSubscribed = true;
			}

			if (!isSubscribed && NewsChannel) {
				const channelLink = NewsChannel.startsWith("@") ? NewsChannel.slice(1) : NewsChannel;
				await ctx.reply(
					`${greet(ctx.chat.first_name)}\n\nJoin our channel to stay updated with the latest features and news about the bot! 📢`,
					{
						reply_markup: privacyTOSKeyboard(ctx).row().url("Join Channel", `https://t.me/${channelLink}`),
						parse_mode: "Markdown",
					},
				);
				return;
			}

			await ctx.reply(greet(ctx.chat.first_name), { parse_mode: "Markdown", reply_markup: privacyTOSKeyboard(ctx) });
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

🛡️ *Security & Privacy:*

The bot supports two security modes:
• *Privacy Mode*: Bot do not remember your credentials. Re-login is required when your session expires.
• *Convenience Mode* (Default): Bot remembers your credentials securely for automatic re-authentication when your session expires.

Manage your settings */security_mode*.

For help - /help
		`,
	);
}
