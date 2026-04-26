import { NextFunction } from "grammy";
import jwt from "jsonwebtoken";
import { BotContext, DB } from "@/config";
import { DefaultPassword, Err } from "@/constants";
import { authTokens } from "@/db/schema/authTokens";
import { SecurityMode } from "@/constants";
import { z } from "zod";
import SoaPService from "@/services/soaPortals";

const AuthToken = z.object({
	exp: z.number("the expiry field of the auth token should be a number"),
});

function isExpired(token: string) {
	try {
		const p = AuthToken.parse(jwt.decode(token, { json: true }));
		return p.exp < Date.now() / 1000;
	} catch (error) {
		return true;
	}
}

export function manageToken(db: DB): (ctx: BotContext, next: NextFunction) => Promise<void> {
	return async (ctx: BotContext, next: NextFunction) => {
		try {
			if (!ctx.auth?.user) {
				await next();
				return;
			}

			const userId = ctx.auth.user.id;
			const passToken = ctx.auth.user.password;
			const securityMode = ctx.auth.securityMode;

			if (!ctx.auth.token || isExpired(ctx.auth.token)) {
				if (securityMode === SecurityMode.Privacy || passToken === DefaultPassword) {
					// In privacy mode, we can't auto-refresh without the password.
					ctx.auth.token = null;
				} else {
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
