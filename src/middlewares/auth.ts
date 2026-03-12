import { NextFunction } from "grammy";
import { Auth, BotContext, DB } from "../config";
import { ReplyNoAuth } from "../constants";

export function auth(db: DB): (ctx: BotContext, next: NextFunction) => Promise<void> {
	return async (ctx: BotContext, next: NextFunction) => {
		const user = await db.query.users.findFirst({
			where({ id }, { eq }) {
				return eq(id, ctx.chat?.id.toString() || "");
			},
		});

		const auth: Auth = {
			user: user || null,
		};

		ctx.auth = auth;

		await next();
	};
}

export function filterNAuth(ctx: BotContext, next: NextFunction) {
	if (!ctx.auth.user) {
		ctx.reply(ReplyNoAuth);
		return;
	}

	next();
}
