import { BotContext } from "@/config";
import { AcceptPrivacyToS, AcceptPrivacyToSRegex, CancelPrivacyToS, CancelPrivacyToSRegex, privacyTOSKeyboard } from "@/constants";
import { InlineKeyboard, NextFunction } from "grammy";

export async function privacyTOS(ctx: BotContext, next: NextFunction) {
	if (!ctx.auth?.user) {
		await next();
		return;
	}

	// console.log(ctx.message?.text)
	// console.log(ctx.update)
	if (ctx.auth.user.privacyToS) {
		await next();
		return;
	}

	if (ctx.hasCallbackQuery(AcceptPrivacyToSRegex) || ctx.hasCallbackQuery(CancelPrivacyToSRegex)) {
		await next();
		return;
	}

	if (!ctx.auth.user.privacyToS) {
		const urlKeys = privacyTOSKeyboard(ctx, 2);
		await ctx.reply(`you need to accept the **Privacy Policy** and **Terms of Service** to use this bot`, {
			parse_mode: "Markdown",
			reply_markup: urlKeys
				.row()
				.text("✅ Accept", ctx.message?.text ? `${AcceptPrivacyToS}_${ctx.message.text}` : AcceptPrivacyToS)
				.text("Cancel", ctx.message?.text ? `${CancelPrivacyToS}_${ctx.message.text}` : CancelPrivacyToS)
				.row(),
		});
		return;
	}
	await next();
}
