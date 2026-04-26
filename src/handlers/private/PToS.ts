import { BotContext } from "@/config";
import { users } from "@/db/schema/users";
import { eq } from "drizzle-orm";
import { DB } from "@/config";
import { Bot, GrammyError } from "grammy";
import { bot } from "@";

export async function acceptPrivacyToS(ctx: BotContext, db: DB) {
	try {
		await ctx.answerCallbackQuery();

		if (!ctx.chat?.id) {
			return;
		}

		if (!ctx.auth?.user?.id) {
			await ctx.editMessageText("You are not logged in");
			return;
		}

		if (ctx.auth.user.privacyToS) {
			await ctx.editMessageText("You have already accepted the Privacy Policy and Terms of Service");
			return;
		}

		await db
			.update(users)
			.set({
				privacyToS: true,
			})
			.where(eq(users.id, ctx.auth.user.id));
		await ctx.editMessageText("Thank You 🙂");

		await bot.handleUpdate({
			update_id: 234139716,
			message: {
				message_id: 100,
				from: {
					id: ctx.me.id,
					is_bot: true,
					first_name: ctx.me.first_name,
					username: ctx.me.username,
				},
				chat: {
					type: "private",
					id: ctx.chat.id,
					first_name: ctx.chat.first_name,
					last_name: ctx.chat.last_name,
					username: ctx.chat.username,
				} as any,
				date: Math.floor(Date.now() / 1000),
				text: ctx.match![1],
				entities: [
					{
						type: "bot_command",
						offset: 0,
						length: ctx.match![1].length,
					},
				],
			},
		});
	} catch (error) {
		if (error instanceof Error) {
			if (!(error instanceof GrammyError)) {
				await ctx.answerCallbackQuery();
				await ctx.editMessageText("Something went wrong. Please try again later");
			}
		}
		console.error("Error in acceptPrivacyToS", error);
	}
}

export async function cancelPrivacyToS(ctx: BotContext, db: DB) {
	try {
		await ctx.answerCallbackQuery();
		await ctx.deleteMessage();
	} catch (error) {
		console.error("Error in cancelPrivacyToS: ", error);
	}
}
