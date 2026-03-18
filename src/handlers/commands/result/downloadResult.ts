import { BotContext, DB } from "../../../config";
import SoaPService from "../../../services/soaPortals";
import { ReplyNoAuth } from "../../../constants";
import { handleErrors } from "../../errorHandler";
import { InputFile } from "grammy";

export async function downloadResult(ctx: BotContext, db: DB) {
	if (!ctx.auth || !ctx.auth.user || !ctx.auth.token || !ctx.match) {
		try {
			await ctx.reply(ReplyNoAuth, { parse_mode: "Markdown" });
		} catch (error) {
			console.error("Error generating pdf:", error);
		}
		return;
	}

	const semNumberStr = ctx.match[1];
	if (!semNumberStr) return;

	try {
		const loadingMsg = await ctx.reply("Downloading result PDF...");

		const service = new SoaPService(ctx.auth.user.password);
		const pdfBuffer = await service.getSemesterResultPdf(ctx.auth.token, parseInt(semNumberStr));

		const buffer = Buffer.from(pdfBuffer);
		const file = new InputFile(buffer, `Result_Semester_${semNumberStr}.pdf`);

		await ctx.replyWithDocument(file, {
			caption: `Here is your result for Semester ${semNumberStr}`,
		});

		// Clean up the loading message
		await ctx.api.deleteMessage(ctx.chat!.id, loadingMsg.message_id);
	} catch (error) {
		console.error("Error in downloadResult:", error);
		await handleErrors(ctx, error as Error);
	}
}
