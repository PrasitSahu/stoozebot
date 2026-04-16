import { eq } from "drizzle-orm";
import { BotContext, DB } from "../../../config";
import { platformUsers } from "../../../db";
import { ReplyDone, ReplySomethingWentWrong } from "../../../constants";

export async function logout(ctx: BotContext, db: DB) {
	if (!ctx.chat) {
		return;
	}

	try {
		await db
			.update(platformUsers)
			.set({
				userId: null,
			})
			.where(eq(platformUsers.platformId, ctx.chat.id.toString()));
		await ctx.reply(ReplyDone);
	} catch (error) {
		try {
			await ctx.reply(ReplySomethingWentWrong);
		} catch (error) {}
		console.error("failed to logout: ", error);
	}
}
