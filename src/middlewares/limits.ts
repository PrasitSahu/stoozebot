import { NextFunction } from "grammy";
import { BotContext, DB } from "../config";
import { ReplyLimitReached } from "../constants";

export function limits(db: DB) {
	return async (ctx: BotContext, next: NextFunction) => {
		const max = Number(process.env.LIMIT_PER_DAY);
		if(!ctx.auth){
			return;
		}

		ctx.api.config.use(async (prev, method, payload, signal) => {
			try {
				if(!ctx.auth || !ctx.chat || ctx.auth.reqs > max){
					return ({ ok: true }) as any;
				} else if(ctx.auth.reqs === max){
					ctx.auth.reqs --; // restrict the recursion
					await ctx.reply(ReplyLimitReached);
					return
				}
			} catch (error) {
				console.log(error);
				return
			}
			return prev(method, payload, signal);
		})

		if(ctx.auth.reqs >= max){
			await ctx.reply(ReplyLimitReached);
			return;
		}
		await next();
	};
}