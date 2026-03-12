import { NextFunction } from "grammy";
import { Auth, BotContext, DB } from "../config";
import { ReplyNoAuth } from "../constants";

export function auth(db: DB): (ctx: BotContext, next: NextFunction) => Promise<void> {
	return async (ctx: BotContext, next: NextFunction) => {
		const platformUserWithuser = await db.query.platformUsers.findFirst({
			where({ platformId }, { eq }) {
				return eq(platformId, ctx.chat?.id.toString() || "");
			},
			with: {
				user: true,
			},
		});

		const auth: Auth = {
			user: platformUserWithuser?.user || null,
		};

		ctx.auth = auth;

		await next();
	};
}

export async function filterNAuth(ctx: BotContext, next: NextFunction) {
	if (!ctx.auth.user) {
		await ctx.reply(ReplyNoAuth, {
			parse_mode: "Markdown",
		});
		return;
	}

	next();
}
