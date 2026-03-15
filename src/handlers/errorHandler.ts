import { BotContext } from "../config";
import { Err, ReplyInvalidCreds, ReplyInvalidFormat, ReplySiteDown, ReplySomethingWentWrong } from "../constants";

export async function handleErrors(ctx: BotContext, error: Error) {
	try {
		if (error instanceof Error) {
			if (error.message === Err.ErrInvalidCred) {
				await ctx.reply(ReplyInvalidCreds, { parse_mode: "Markdown" });
				return;
			}
			if (error.message === Err.ErrFormat) {
				await ctx.reply(ReplyInvalidFormat, { parse_mode: "Markdown" });
				return;
			}
			if (error.message === Err.ErrReqFail) {
				await ctx.reply(ReplySiteDown, { parse_mode: "Markdown" });
				return;
			}
		}
		console.error(error);
		await ctx.reply(ReplySomethingWentWrong, { parse_mode: "Markdown" });
	} catch (error) {
		console.error(error);
	}
	return;
}
