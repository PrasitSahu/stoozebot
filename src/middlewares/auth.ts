import { and, eq, sql } from "drizzle-orm";
import { NextFunction } from "grammy";
import { Auth, BotContext, DB } from "@/config";
import { Err, Platform, ReplyNoAuth } from "@/constants";
import { platformUsers } from "@/db/schema/platformUsers";

export function auth(db: DB): (ctx: BotContext, next: NextFunction) => Promise<void> {
	return async (ctx: BotContext, next: NextFunction) => {
		if (!ctx.chat) {
			return;
		}

		const max = Number(process.env.LIMIT_PER_DAY);
		try {
			const reqs = await db
				.update(platformUsers)
				.set({
					reqs: sql`
					CASE
						WHEN ${platformUsers.lastReqAt} < datetime('now', 'start of day')
						THEN 1
						WHEN ${platformUsers.reqs} > ${max}
						THEN ${platformUsers.reqs}
						ELSE ${platformUsers.reqs} + 1
					END
				`,
					lastReqAt: sql`datetime('now')`,
				})
				.where(and(eq(platformUsers.platformId, ctx.chat.id.toString()), eq(platformUsers.platform, Platform.Telegram)))
				.returning({ reqs: platformUsers.reqs });

			if (reqs.length === 0) {
				await db
					.insert(platformUsers)
					.values({
						platform: Platform.Telegram,
						platformId: ctx.chat.id.toString(),
						reqs: 1,
						lastReqAt: sql`datetime('now')`,
					})
					.onConflictDoNothing();
			}

			const platformUserWithuser = await db.query.platformUsers.findFirst({
				where({ platformId }, { eq }) {
					return eq(platformId, ctx.chat?.id.toString() || "");
				},
				with: {
					user: {
						with: {
							authToken: true,
						},
					},
				},
			});

			if (!platformUserWithuser) {
				ctx.auth = null;
				await next();
				return;
			}

			const auth: Auth = {
				user: platformUserWithuser.user,
				// Fix: if no reqs, set to max
				reqs: reqs.length ? reqs[0].reqs : 1,
				token: platformUserWithuser.user?.authToken?.token || null,
				securityMode: platformUserWithuser.securityMode,
			};
			ctx.auth = auth;
		} catch (error) {
			if (error instanceof Error) {
				if (error.message === Err.ErrReqFail) {
					await next();
					return;
				}
			}
			console.error(error);
		}
		await next();
	};
}

export async function filterNAuth(ctx: BotContext, next: NextFunction) {
	if (!ctx.auth || !ctx.auth.user) {
		await ctx.reply(ReplyNoAuth, {
			parse_mode: "Markdown",
		});
		return;
	}

	try {
		await next();
	} catch (error) {
		console.error(error);
	}
}
