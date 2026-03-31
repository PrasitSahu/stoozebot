import { BotContext } from "../config";
import { Err, ReplyFailRes, ReplyInvalidCreds, ReplyInvalidFormat, ReplySiteDown, ReplySomethingWentWrong } from "../constants";

export async function handleErrors(ctx: BotContext, error: Error) {
	try {
		if (error instanceof Error) {
			switch (error.message) {
				case Err.ErrAuth:
					await ctx.reply(Err.ErrAuth, { parse_mode: "Markdown" });
					break;
				case Err.ErrInvalidCred:
					await ctx.reply(ReplyInvalidCreds, { parse_mode: "Markdown" });
					break;
				case Err.ErrFormat:
					await ctx.reply(ReplyInvalidFormat, { parse_mode: "Markdown" });
					break;
				case Err.ErrReqFail:
					await ctx.reply(ReplySiteDown, { parse_mode: "Markdown" });
					break;
				case Err.ErrFailRes:
					await ctx.reply(ReplyFailRes)
					break
				default:
					console.error(error);
					await ctx.reply(ReplySomethingWentWrong, { parse_mode: "Markdown" });
					break;
			}
		}
	} catch (error) {
		console.error(error);
	}
	return;
}
