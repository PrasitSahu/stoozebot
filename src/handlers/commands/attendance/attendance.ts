import { InferSelectModel } from "drizzle-orm";
import { BotContext, DB } from "../../../config";
import { Err, ReplyNoAuth, ReplySiteDown } from "../../../constants";
import { users } from "../../../db";
import SoaPService, { Attendance, AttendanceResponse, Response } from "../../../services/soaPortals";
import { text } from "../../../utils";
import { handleErrors } from "../../errorHandler";
import { attendances as attendancesTable } from "../../../db/schema/attendances";
import { eq, and } from "drizzle-orm";

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
	await ctx.answerCallbackQuery();
	let user: InferSelectModel<typeof users>;

	try {
		if (!ctx.auth?.user) {
			await ctx.reply(ReplyNoAuth, {
				parse_mode: "Markdown",
			});
			return;
		}

		user = ctx.auth.user;

		if (!ctx.match) {
			return;
		}
		const regId = ctx.match[1];
		const regCode = ctx.match[2];

		if (!ctx.auth?.token) {
			console.error("token not found in auth");
			throw new Error(Err.ErrAuth);
		}

		await ctx.replyWithChatAction("typing");

		const soaPortalService = new SoaPService(user.password);
		let attendancesRes: Response<AttendanceResponse>;
		let attendances: Attendance[];
		let fromSource: boolean = true;
		try {
			attendancesRes = await soaPortalService.getAttendance(ctx.auth.token, regId);

			if (attendancesRes.status.responseStatus !== "Success") {
				console.error("failed to fetch attendance");
				throw new Error(Err.ErrFailRes);
			}

			attendances = attendancesRes.response.studentattendancelist;
			if (!attendances) {
				console.error("failed to detect attendance sem list type in 'attendance' command");
				throw new Error(Err.ErrFormat);
			}
		} catch (error) {
			if (error instanceof Error && error.message === Err.ErrReqFail) {
				fromSource = false;
				const a = await db.select().from(attendancesTable).where(and(eq(attendancesTable.userId, user.id), eq(attendancesTable.regId, regId), eq(attendancesTable.regCode, regCode)));
				attendances = a.map((a) => {
					return {
						slno: a.slNo,
						subject: a.subject,
						subjectcode: a.subjectCode,
						TotalClass: a.total,
						Attendanceperc: a.percentage,
						sty_no: a.sem,
					};
				});
			} else {
				throw error;
			}
		}

		if (!attendances.length) {
			let msg = "No attendance saved 🙂";
			if (!fromSource) {
				msg = ReplySiteDown + "\n" + msg;
			}
			await ctx.reply(msg);
			return;
		}

		const replies = attendances.map(async (a) => {
			if (fromSource) {
				await db
					.insert(attendancesTable)
					.values({
						slNo: a.slno,
						subject: a.subject,
						subjectCode: a.subjectcode,
						total: a.TotalClass,
						percentage: a.Attendanceperc,
						sem: a.sty_no,
						userId: user.id,
						regCode: regCode,
						regId: regId,
					})
					.onConflictDoUpdate({
						target: [attendancesTable.userId, attendancesTable.subjectCode, attendancesTable.regCode, attendancesTable.regId],
						set: {
							slNo: a.slno,
							subject: a.subject,
							subjectCode: a.subjectcode,
							total: a.TotalClass,
							percentage: a.Attendanceperc,
							sem: a.sty_no,
							userId: user.id,
						},
					});
			}

			return ReplyAttendance({
				index: a.slno,
				sub: a.subject,
				subCode: a.subjectcode,
				totalCls: a.TotalClass,
				perc: a.Attendanceperc,
			});
		});

		const reply = (await Promise.all(replies)).join(sep);
		await ctx.reply(reply, {
			parse_mode: "Markdown",
		});
	} catch (error) {
		await handleErrors(ctx, error as Error);
	}
}
