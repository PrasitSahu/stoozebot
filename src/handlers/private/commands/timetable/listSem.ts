import { eq } from "drizzle-orm";
import { InlineKeyboard } from "grammy";
import { BotContext, DB } from "@/config";
import { Err, ReplyNoAuth } from "@/constants";
import { timetables } from "@/db/schema/timetables";
import SoaPService, { Response, TimetableReg, TimetableRegListResponse } from "@/services/soaPortals";
import { handleErrors } from "@/handlers/errorHandler";

export async function timetable(ctx: BotContext, db: DB) {
	try {
		if (!ctx.auth?.user) {
			await ctx.reply(ReplyNoAuth, {
				parse_mode: "Markdown",
			});
			return;
		}

		if (!ctx.auth.token) {
			throw new Error(Err.ErrAuth);
		}

		await ctx.replyWithChatAction("typing");

		const soaPortalService = new SoaPService(ctx.auth.user.password || "");

		let timetableSemList: Response<TimetableRegListResponse>;
		let semList: TimetableReg[] = [];
		try {
			timetableSemList = await soaPortalService.getTimetableSemList(ctx.auth.token);
			if (timetableSemList.status.responseStatus !== "Success") {
				throw new Error(Err.ErrFailRes);
			}

			semList = timetableSemList.response.regList;
			if (!semList) {
				throw new Error(Err.ErrFormat);
			}
		} catch (error) {
			if (error instanceof Error && error.message === Err.ErrReqFail) {
				const t = await db.select().from(timetables).where(eq(timetables.userId, ctx.auth.user.id));
				semList = t.map<TimetableReg>((t) => {
					return {
						registrationcode: t.regCode,
						registrationid: t.regId,
						registrationdatefrom: 0, // Not stored in DB
						registrationdateto: 0, // Not stored in DB
						registrationdesc: t.regCode, // Using regCode as desc
					};
				});
				semList = removeDup(semList);
			} else {
				throw error;
			}
		}

		if (!semList.length) {
			await ctx.reply("No timetable found");
			return;
		}
		const btns = semList.map((sem) => [
			InlineKeyboard.text(sem.registrationcode, `#timetable ${sem.registrationid}-${sem.registrationcode}`),
		]);
		const semInlineKeyboard = InlineKeyboard.from(btns);
		await ctx.reply("Select the semester for your timetable", {
			reply_markup: semInlineKeyboard,
		});
	} catch (error) {
		console.error("Error fetching timetable sem list");
		await handleErrors(ctx, error as Error);
	}
}

function removeDup(semList: TimetableReg[]) {
	const seen = new Set<string>();
	return semList.filter((sem) => {
		const key = `${sem.registrationcode}-${sem.registrationid}`;
		if (seen.has(key)) {
			return false;
		}
		seen.add(key);
		return true;
	});
}
