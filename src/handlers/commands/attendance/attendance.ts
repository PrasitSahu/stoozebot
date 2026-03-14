import { InferSelectModel } from "drizzle-orm";
import { BotContext, DB } from "../../../config";
import { Err, ReplyNoAuth } from "../../../constants";
import { users } from "../../../db";
import Service from "../../../services/soaPortals";
import { text } from "../../../utils";
import { handleErrors } from "../../errorHandler";

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

		if(!ctx.auth?.token){
			console.error("token not found in auth");
			throw new Error(Err.ErrAuth);
		}

		const attendancesRes = await soaPortalService.getAttendance(ctx.auth.token, regId);
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
	
	} catch (error) {
		await handleErrors(ctx, error as Error);
	}
}
