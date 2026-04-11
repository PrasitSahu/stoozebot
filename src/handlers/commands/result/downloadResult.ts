import { and, eq } from "drizzle-orm";
import { InlineKeyboard, InputFile } from "grammy";
import { BotContext, DB } from "../../../config";
import { Err, ReplyNoAuth, ReplySiteDown } from "../../../constants";
import { results } from "../../../db/schema/results";
import SoaPService from "../../../services/soaPortals";
import { handleErrors } from "../../errorHandler";

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
	const isRefresh = ctx.match[2] === "r";
	if (!semNumberStr) return;
	const stynumber = parseInt(semNumberStr);

	try {
		await ctx.answerCallbackQuery();

		// 1. Check if we already have the file_id cached in the DB (unless refreshing)
		if (!isRefresh) {
			const cached = await db.query.results.findFirst({
				where: and(eq(results.userId, ctx.auth.user.id), eq(results.sem, stynumber)),
			});

			if (cached?.doc) {
				await ctx.replyWithDocument(cached.doc, {
					caption: resultCaption(semNumberStr, true),
					reply_markup: new InlineKeyboard().text("Refresh", `#result ${semNumberStr} r`),
				});
				return;
			}
		}

		// 2. If not cached or refreshing, download and send
		try {
			await ctx.deleteMessage();
		} catch (err) {}
		const loadingMsg = await ctx.reply(isRefresh ? "Refreshing result PDF..." : "Downloading result PDF...");
		const service = new SoaPService(ctx.auth.user.password);
		const pdfBuffer = await service.getSemesterResultPdf(ctx.auth.token, stynumber);

		const file = new InputFile(Buffer.from(pdfBuffer), `Result_Semester_${semNumberStr}.pdf`);
		const sentMsg = await ctx.replyWithDocument(file, {
			caption: resultCaption(semNumberStr, false),
		});

		// 3. Save/Update the file_id for future use
		if (sentMsg.document?.file_id) {
			await db
				.update(results)
				.set({ doc: sentMsg.document.file_id })
				.where(and(eq(results.userId, ctx.auth.user.id), eq(results.sem, stynumber)));
		}

		await ctx.api.deleteMessage(ctx.chat!.id, loadingMsg.message_id);
	} catch (error) {
		if (error instanceof Error) {
			if (error.message === Err.ErrReqFail || error.message === Err.ErrFormat) {
				await ctx.reply(ReplySiteDown);
			} else {
				return await handleErrors(ctx, error as Error);
			}
		} else {
			console.error("Error generating pdf:", error);
		}
	}

	function resultCaption(semNumberStr: string, cached: boolean): string {
		return `Here is your result for Semester ${semNumberStr}${cached ? " (cached)" : ""}`;
	}
}
