import { and, eq } from "drizzle-orm";
import { InlineKeyboard, InputFile } from "grammy";
import { BotContext, DB } from "../../../../config";
import { Err, ReplyNoAuth, ReplySiteDown } from "../../../../constants";
import { results } from "../../../../db/schema/results";
import SoaPService from "../../../../services/soaPortals";
import { handleErrors } from "../../../errorHandler";

export async function downloadResult(ctx: BotContext, db: DB) {
	try {
		if (!ctx.auth || !ctx.auth.user || !ctx.auth.token || !ctx.match) {
			await ctx.reply(ReplyNoAuth, {
				parse_mode: "Markdown",
			});
			return;
		}

		const semNumberStr = ctx.match[1];
		const isRefresh = ctx.match[2] === "r";
		if (!semNumberStr) {
			throw new Error(Err.ErrFormat);
		}
		const stynumber = parseInt(semNumberStr);
		await ctx.answerCallbackQuery();

		if (!isRefresh) {
			await ctx.replyWithChatAction("upload_document");
			const cached = await db.query.results.findFirst({
				where: and(eq(results.userId, ctx.auth.user.id), eq(results.sem, stynumber)),
			});

			if (cached?.doc) {
				await ctx.editMessageMedia(
					{
						type: "document",
						media: cached.doc,
						caption: resultCaption(semNumberStr, true),
					},
					{
						reply_markup: new InlineKeyboard().text("Refresh", `#result ${semNumberStr} r`),
					},
				);
				return;
			}
		}

		await ctx.editMessageText(isRefresh ? "Refreshing result PDF..." : "Downloading result PDF...");
		const service = new SoaPService(ctx.auth.user.password);
		const pdfBuffer = await service.downloadSemesterResultPdf(ctx.auth.token, stynumber);

		const file = new InputFile(Buffer.from(pdfBuffer), `Result_Semester_${semNumberStr}.pdf`);
		const sentMsg = await ctx.editMessageMedia({
			type: "document",
			media: file,
			caption: resultCaption(semNumberStr, false),
		});

		if (typeof sentMsg == "boolean") {
			throw new Error("tried to edit a message with inline message");
		}

		if (sentMsg.document?.file_id) {
			await db
				.update(results)
				.set({ doc: sentMsg.document.file_id })
				.where(and(eq(results.userId, ctx.auth.user.id), eq(results.sem, stynumber)));
		}
	} catch (error) {
		if (error instanceof Error) {
			if (error.message === Err.ErrReqFail || error.message === Err.ErrFormat) {
				await ctx.reply(ReplySiteDown);
			}
		} else {
			console.error("Error generating pdf");
			return await handleErrors(ctx, error);
		}
	}

	function resultCaption(semNumberStr: string, cached: boolean): string {
		return `Here is your result for Semester ${semNumberStr}${cached ? " (cached)" : ""} 😊`;
	}
}
