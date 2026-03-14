import { InferSelectModel } from "drizzle-orm";
import jwt from "jsonwebtoken";
import { BotContext, DB } from "../../../config";
import { Err, ReplyInvalidCreds, ReplyInvalidFormat, ReplyNoAuth, ReplySomethingWentWrong } from "../../../constants";
import { users } from "../../../db";
import Service from "../../../services/soaPortals";
import { text } from "../../../utils";
import { upsertNewToken } from "./listSem";

interface ReplyAttendanceParam {
	index: number;
	sub: string;
	subCode: string;
	totalCls: string;
	perc: string;
}

const imojiNums = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟"];
const ReplyAttendance = (param: ReplyAttendanceParam) =>
	text(
		`
        ${imojiNums.length >= param.index ? imojiNums[param.index] : param.index} ${param.sub} (${param.subCode})\n📚 Classes: ${param.totalCls}\n✅ Attendance: ${param.perc}
    `,
	);
const sep = "\n\n➖➖➖➖➖➖➖➖\n\n";

export async function getAttendance(ctx: BotContext, db: DB) {
	let user: InferSelectModel<typeof users>;
	if (!ctx.auth?.user) {
		await ctx.reply(ReplyNoAuth, {
			parse_mode: "Markdown",
		});
		return;
	}

	user = ctx.auth.user;

	const soaPortalService = new Service(user.password);
	try {
		if (!ctx.match) {
			return;
		}
		const regId = ctx.match[1];

		const authToken = await db.query.authTokens.findFirst({
			where(table, { eq }) {
				return eq(table.userId, user.id);
			},
		});

		var token: string;
		if (!authToken?.token) {
			token = await upsertNewToken(user.password, db, user.id);
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
				token = await upsertNewToken(user.password, db, user.id);
			}

			const attendancesRes = await soaPortalService.getAttendance(token, regId);
			if (attendancesRes?.status?.responseStatus !== "Success") {
				console.error("failed to fetch attendance");
				throw new Error(Err.ErrFailRes);
			}

			const attendances = attendancesRes?.response?.studentattendancelist;
			if (!attendances) {
				console.error("failed to detect attendance sem list type in 'attendance' command");
				throw new Error(Err.ErrFormat);
			}

			const replies = attendances.map((a) =>
				ReplyAttendance({
					index: a.slno,
					sub: a.subject,
					subCode: a.subjectcode,
					totalCls: a.TotalClass,
					perc: a.Attendanceperc,
				}),
			);

			const reply = replies.join(sep);
			await ctx.reply(reply, {
				parse_mode: "Markdown",
			});
		}
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
