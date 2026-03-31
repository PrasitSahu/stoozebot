import { NextFunction } from "grammy";
import jwt from "jsonwebtoken";
import { BotContext, DB } from "../config";
import { Err } from "../constants";
import { authTokens } from "../db/schema/authTokens";
import SoaPService from "../services/soaPortals";
import z, { number } from "zod";

const AuthToken = z.object({
	exp: number("the expiry field of the auth token should be a number"),
});

export function manageToken(db: DB): (ctx: BotContext, next: NextFunction) => Promise<void> {
	return async (ctx: BotContext, next: NextFunction) => {
		try {
			if (!ctx.auth?.user) {
				await next();
				return;
			}

			const userId = ctx.auth.user.id;
			const passToken = ctx.auth.user.password;

			if (!ctx.auth.token) {
				ctx.auth.token = await upsertNewToken(passToken, db, userId);
			} else {
				var p = AuthToken.parse(jwt.decode(ctx.auth.token, { json: true }));

				if (p.exp < Date.now() / 1000) {
					ctx.auth.token = await upsertNewToken(passToken, db, userId);
				}
			}
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

export async function upsertNewToken(passToken: string, db: DB, userId: string) {
	const soaPortalService = new SoaPService(passToken);
	const tokenRes = await soaPortalService.genToken();

	if (tokenRes.status.responseStatus !== "Success") {
		throw new Error(Err.ErrInvalidCred);
	}

	const token = tokenRes.response.regdata.token;

	await db.insert(authTokens).values({ userId, token }).onConflictDoUpdate({
		target: authTokens.userId,
		set: { token },
	});
	return token;
}
