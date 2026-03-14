import { NextFunction } from "grammy";
import jwt from "jsonwebtoken";
import { BotContext, DB } from "../config";
import { Err } from "../constants";
import { authTokens } from "../db/schema/authTokens";
import soaPService from "../services/soaPortals";

export function manageToken(db: DB): (ctx: BotContext, next: NextFunction) => Promise<void> {
    return async (ctx: BotContext, next: NextFunction) => {
        try{
            if(!ctx.auth?.user) {
                await next();
                return;
            }
            
            const userId = ctx.auth.user.id;
            const passToken = ctx.auth.user.password;

			if (!ctx.auth.token) {
				ctx.auth.token = await upsertNewToken(passToken, db, userId);
			} else {
				var payload: jwt.JwtPayload;
				var p = jwt.decode(ctx.auth.token, { json: true });
				if (!p) {
					throw new Error("failed to decode jwt");
				} else {
					payload = p;
				}

				if ((payload?.exp as number) < Date.now()) {
					ctx.auth.token = await upsertNewToken(passToken, db, userId);
				}
			}

        } catch(error){
			if(error instanceof Error){
				if(error.message === Err.ErrReqFail){
					await next()
					return
				}
			}
			console.error(error)
        }
		await next();
    }
}

export async function upsertNewToken(passToken: string, db: DB, userId: string) {
	const soaPortalService = new soaPService(passToken);
	const tokenRes = await soaPortalService.genToken();

	if (tokenRes?.status?.responseStatus !== "Success") {
		throw new Error(Err.ErrInvalidCred);
	}

	const token = tokenRes?.response?.regdata?.token;

	if (!token) {
		console.error("failed to detect the token type in 'genToken'");
		throw new Error(Err.ErrFormat);
	}

	await db.insert(authTokens).values({ userId, token }).onConflictDoUpdate({
		target: authTokens.userId,
		set: { token },
	});
	return token;
}