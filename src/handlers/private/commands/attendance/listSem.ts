import { eq } from "drizzle-orm";
import { InlineKeyboard } from "grammy";
import { BotContext, DB } from "../../../../config";
import { Err, ReplyNoAuth } from "../../../../constants";
import { attendances } from "../../../../db/schema/attendances";
import SoaPService, { Response, Sem, SemListResponse } from "../../../../services/soaPortals";
import { handleErrors } from "../../../errorHandler";

export async function attendance(ctx: BotContext, db: DB) {
	try {
		if (!ctx.auth?.user) {
			await ctx.reply(ReplyNoAuth, {
				parse_mode: "Markdown",
			});
			return;
		}

		if (!ctx.auth.token) {
			console.error("token not found in auth");
			throw new Error(Err.ErrAuth);
		}

		await ctx.replyWithChatAction("typing");

		const soaPortalService = new SoaPService(ctx.auth.user.password);

		let attendanceSemList: Response<SemListResponse>;
		let semList: Sem[] = [];
		try {
			attendanceSemList = await soaPortalService.getAttendanceSemList(ctx.auth.token);
			if (attendanceSemList.status.responseStatus !== "Success") {
				console.error("failed to fetch attendance");
				throw new Error(Err.ErrFailRes);
			}

			semList = attendanceSemList.response.semlist;
			if (!semList) {
				console.error("failed to detect attendance sem list type in 'attendance' command");
				throw new Error(Err.ErrFormat);
			}
		} catch (error) {
			if (error instanceof Error) {
				if (error.message === Err.ErrReqFail) {
					const a = await db.select().from(attendances).where(eq(attendances.userId, ctx.auth.user.id));
					semList = a.map<Sem>((a) => {
						return {
							registrationcode: a.regCode,
							registrationid: a.regId,
						};
					});
					semList = removeDup(semList);
				}
			} else {
				throw error;
			}
		}

		if (!semList.length) {
			await ctx.reply("No attendance found");
			return;
		}
		const btns = semList.map((sem) => [
			InlineKeyboard.text(sem.registrationcode, `#attendance ${sem.registrationid}-${sem.registrationcode}`),
		]);
		const semInlineKeyboard = InlineKeyboard.from(btns);
		await ctx.reply("Select from your sem list", {
			reply_markup: semInlineKeyboard,
		});
	} catch (error) {
		console.error("Error fetching attendance sem list");
		await handleErrors(ctx, error);
	}
}

function removeDup(semList: Sem[]) {
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
