import { ApiCallFn, NextFunction, RawApi } from "grammy";
import { BotContext } from "@/config";
import { GlobalThrottlerKey, ReplyLimitReached } from "@/constants";

export async function limits(ctx: BotContext, next: NextFunction) {
	const max = Number(process.env.LIMIT_PER_DAY);
	if (!ctx.auth) {
		return;
	}

	ctx.api.config.use(async (prev, method, payload, signal) => {
		try {
			if (!ctx.auth || !ctx.chat || ctx.auth.reqs > max) {
				return { ok: true } as any;
			} else if (ctx.auth.reqs === max) {
				ctx.auth.reqs--; // restrict the recursion
				await ctx.reply(ReplyLimitReached);
				return;
			}
		} catch (error) {
			console.log(error);
			return;
		}
		return prev(method, payload, signal);
	});

	if (ctx.auth.reqs >= max) {
		await ctx.reply(ReplyLimitReached);
		return;
	}
	await next();
}

export function botApiLimit(env: Env) {
	return async (ctx: BotContext, next: NextFunction) => {
		if (!ctx.chat?.id) return;
		if (env.BOT_THROTTLER) {
			const throttlerId = env.BOT_THROTTLER.idFromName(GlobalThrottlerKey);
			const throttler = env.BOT_THROTTLER.get(throttlerId);

			const { delay } = await throttler.getDelay(ctx.chat.id.toString());

			if (delay > 0) {
				await new Promise((resolve) => setTimeout(resolve, delay));
			}
		}
		await next();
	};
}
