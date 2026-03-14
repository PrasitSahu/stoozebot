import { InlineKeyboard } from "grammy";
import jwt from "jsonwebtoken";
import { BotContext, DB } from "../../../config";
import { Err, ReplyInvalidCreds, ReplyInvalidFormat, ReplyNoAuth, ReplySomethingWentWrong } from "../../../constants";
import { authTokens } from "../../../db";
import Service from "../../../services/soaPortals";

export async function attendance(ctx: BotContext, db: DB) {
	let userId: string;
	let passToken: string;
	if (!ctx.auth?.user) {
		await ctx.reply(ReplyNoAuth, {
			parse_mode: "Markdown",
		});
		return;
	}

	userId = ctx.auth.user.id;
	passToken = ctx.auth.user.password;
	try {
		const authToken = await db.query.authTokens.findFirst({
			where(table, { eq }) {
				return eq(table.userId, userId);
			},
		});

		var token: string;
		if (!authToken?.token) {
			token = await upsertNewToken(passToken, db, userId);
		} else {
			token = authToken.token;

			var payload: jwt.JwtPayload;
			var p = jwt.decode(token, { json: true });
			if (!p) {
				throw new Error("failed to decode jwt");
			} else {
				payload = p;
			}

			if ((payload?.exp as number) < Date.now()) {
				token = await upsertNewToken(passToken, db, userId);
			}
		}

		const soaPortalService = new Service(passToken);
		const attendanceSemList = await soaPortalService.getAttendanceSemList(token);

		if (attendanceSemList?.status?.responseStatus !== "Success") {
			console.error("failed to fetch attendance");
			throw new Error(Err.ErrFailRes);
		}

		const semList = attendanceSemList?.response?.semlist;
		if (!semList) {
			console.error("failed to detect attendance sem list type in 'attendance' command");
			throw new Error(Err.ErrFormat);
		}

		const btns = semList.map((sem) => [InlineKeyboard.text(sem.registrationcode, `#attendance ${sem.registrationid}`)]);

		const semInlineKeyboard = InlineKeyboard.from(btns);
		await ctx.reply("Select from your sem list", {
			reply_markup: semInlineKeyboard,
		});
	} catch (error) {
		if (error instanceof Error) {
			if (error.message === Err.ErrFormat) {
				await ctx.reply(ReplyInvalidFormat);
				return;
			}

			if (error.message === Err.ErrInvalidCred) {
				await ctx.reply(ReplyInvalidCreds);
				return;
			}
		}

		console.log(error);
		await ctx.reply(ReplySomethingWentWrong);
		return;
	}
}

export async function upsertNewToken(passToken: string, db: DB, userId: string) {
	const soaPortalService = new Service(passToken);
	const tokenRes = await soaPortalService.genToken();

	if (tokenRes?.status?.responseStatus !== "Success") {
		// TODO: fix this with update password for change in password
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
