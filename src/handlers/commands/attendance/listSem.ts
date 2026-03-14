import { InlineKeyboard } from "grammy";
import { BotContext, DB } from "../../../config";
import { Err, ReplyNoAuth } from "../../../constants";
import soaPService from "../../../services/soaPortals";
import { handleErrors } from "../../errorHandler";

export async function attendance(ctx: BotContext, db: DB) {
	if (!ctx.auth?.user) {
		await ctx.reply(ReplyNoAuth, {
			parse_mode: "Markdown",
		});
		return;
	}

	try {
		if(!ctx.auth.token){
			console.error("token not found in auth");
			throw new Error(Err.ErrAuth);
		}
		const soaPortalService = new soaPService(ctx.auth.user.password);
		const attendanceSemList = await soaPortalService.getAttendanceSemList(ctx.auth.token);

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
		await handleErrors(ctx, error as Error);
	}
}
