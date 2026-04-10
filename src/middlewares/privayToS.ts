import { InlineKeyboard, Keyboard, NextFunction } from "grammy";
import { BotContext } from "../config";
import { AcceptPrivacyToS, CancelPrivacyToS } from "../constants";

export async function privacyTOS(ctx: BotContext, next: NextFunction) {
	if (!ctx.auth?.user) {
		await next();
		return;
	}

	if (ctx.hasCallbackQuery(AcceptPrivacyToS) || ctx.hasCallbackQuery(CancelPrivacyToS)) {
		await next();
		return;
	}

	const keyboard = new InlineKeyboard()
		.text("✅ Accept", AcceptPrivacyToS)
		.text("Cancel", CancelPrivacyToS)
		.row()
		.webApp("Privacy Policy", `${process.env.PAGES_URL}/privacyPolicy`)
		.row()
		.webApp("Terms of Service", `${process.env.PAGES_URL}/termsOfService`);

	if (!ctx.auth.user.privacyToS) {
		await ctx.reply(`you need to accept the **Privacy Policy** and **Terms of Service** to use this bot`, {
			parse_mode: "Markdown",
			reply_markup: keyboard,
		});
		return;
	}
	await next();
}
