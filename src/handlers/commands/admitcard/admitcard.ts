import { InlineKeyboard } from "grammy";
import { BotContext, DB } from "../../../config";
import { Err, ReplyNoAuth } from "../../../constants";
import SoaPService from "../../../services/soaPortals";
import { handleErrors } from "../../errorHandler";

export async function admitcard(ctx: BotContext) {
	try {
		if (!ctx.auth?.user || !ctx.auth.token) {
			await ctx.reply(ReplyNoAuth, {
				parse_mode: "Markdown",
			});
			return;
		}

		await ctx.replyWithChatAction("typing");

		const soaPortalService = new SoaPService(ctx.auth.user.password);
		const metaDataRes = await soaPortalService.getAdmitCardMetaData(ctx.auth.token);

		if (metaDataRes.status.responseStatus !== "Success") {
			throw new Error(Err.ErrFailRes);
		}

		const regList = metaDataRes.response.regList;
		if (!regList || regList.length === 0) {
			await ctx.reply("No registration records found for admit card.");
			return;
		}

		const btns = regList.map((reg) => [InlineKeyboard.text(reg.REGISTRATIONCODE, `#admitcard_reg ${reg.REGISTRATIONID}`)]);

		await ctx.reply("Select a registration for your admit card:", {
			reply_markup: InlineKeyboard.from(btns),
		});
	} catch (error) {
		await handleErrors(ctx, error);
	}
}

export async function listExamTypes(ctx: BotContext) {
	try {
		if (!ctx.auth?.user || !ctx.auth.token || !ctx.match) {
			throw new Error(Err.ErrAuth);
		}

		const regId = ctx.match[1];
		await ctx.answerCallbackQuery();
		await ctx.replyWithChatAction("typing");

		const soaPortalService = new SoaPService(ctx.auth.user.password);
		const metaDataRes = await soaPortalService.getAdmitCardMetaData(ctx.auth.token);

		if (metaDataRes.status.responseStatus !== "Success") {
			throw new Error(Err.ErrFailRes);
		}

		const examTypes = metaDataRes.response.examTypeList;
		if (!examTypes || examTypes.length === 0) {
			await ctx.editMessageText("No exam types found for this registration.");
			return;
		}

		const btns = examTypes.map((exam) => [InlineKeyboard.text(exam.EXAMTYPEDESC, `#admitcard_exam ${regId}_${exam.EXAMTYPEID}`)]);

		await ctx.editMessageText("Select exam type:", {
			reply_markup: InlineKeyboard.from(btns),
		});
	} catch (error) {
		console.error("Error fetching exam types");
		await handleErrors(ctx, error);
	}
}

export async function listExamCodes(ctx: BotContext) {
	try {
		if (!ctx.auth?.user || !ctx.auth.token || !ctx.match) {
			throw new Error(Err.ErrAuth);
		}

		const regId = ctx.match[1];
		const examTypeId = ctx.match[2];

		await ctx.answerCallbackQuery();
		await ctx.replyWithChatAction("typing");

		const soaPortalService = new SoaPService(ctx.auth.user.password);
		const examCodesRes = await soaPortalService.getAdmitCardExamCodes(ctx.auth.token, regId, examTypeId);

		if (examCodesRes.status.responseStatus !== "Success") {
			throw new Error(Err.ErrFailRes);
		}

		const examCodes = examCodesRes.response.examList.examCode;
		if (!examCodes || examCodes.length === 0) {
			await ctx.reply("No exam events found.");
			return;
		}

		const btns = examCodes.map((exam) => [InlineKeyboard.text(exam.EXAMEVENTCODE, `#admitcard_dn ${regId}_${exam.EXAMEVENTID}`)]);

		await ctx.editMessageText("Select specific exam event:", {
			reply_markup: InlineKeyboard.from(btns),
		});
	} catch (error) {
		console.error("Error fetching exam codes");
		await handleErrors(ctx, error);
	}
}
