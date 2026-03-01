import { NextFunction } from "grammy";
import { Auth, BotContext, DB } from "../config";
import { Platform } from "../constants";

export function auth(db: DB): (ctx: BotContext, next: NextFunction) => Promise<void> {
	return async (ctx: BotContext, next: NextFunction) => {
		const platformUser = await db.query.platformUsers.findFirst({
			where: (table, { eq, and }) => and(eq(table.platform, Platform.Telegram), eq(table.platformId, ctx.chat?.id.toString() || "")),
		});

		const auth: Auth = {
			telegramUser: platformUser || null,
		};

		ctx.auth = auth;

		await next();
	};
}
