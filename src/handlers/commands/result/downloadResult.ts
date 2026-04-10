import { eq, and } from "drizzle-orm";
import { BotContext, DB } from "../../../config";
import SoaPService from "../../../services/soaPortals";
import { Err, ReplyNoAuth, ReplySiteDown } from "../../../constants";
import { handleErrors } from "../../errorHandler";
import { InputFile } from "grammy";
import { results } from "../../../db/schema/results";
import { Message } from "grammy/types";

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
	const stynumber = parseInt(semNumberStr);
	const r2Key = `results/${ctx.auth.user.id}/sem_${stynumber}.pdf`;

	let pdfBuffer: ArrayBuffer | null = null;
	let loadingMsg: Message.TextMessage | null = null;
	let errMsg = "";
	try {
		await ctx.answerCallbackQuery();
		loadingMsg = await ctx.reply("Downloading result PDF...");
		pdfBuffer = await fetchAndCache(ctx, db, stynumber, r2Key);
	} catch (error) {
		errMsg = "Failed to download result";
		if (error instanceof Error) {
			if (error.message === Err.ErrReqFail || error.message === Err.ErrFormat) {
				const cached = await db.query.results.findFirst({
					where: and(eq(results.userId, ctx.auth.user.id), eq(results.sem, stynumber)),
				});

				if (cached?.doc) {
					// const obj = await ctx.r2.get(cached.doc);
					// if (obj) {
					// 	pdfBuffer = await obj.arrayBuffer();
					// } else {
					// 	errMsg = ReplySiteDown;
					// }
				} else {
					errMsg = ReplySiteDown;
				}
			} else {
				return await handleErrors(ctx, error as Error);
			}
		} else {
			console.error("Error generating pdf:", error);
			return;
		}
	}

	if (!pdfBuffer || !loadingMsg) {
		await ctx.reply(errMsg);
		return;
	}

	const file = new InputFile(Buffer.from(pdfBuffer), `Result_Semester_${semNumberStr}.pdf`);
	await ctx.replyWithDocument(file, { caption: `Here is your result for Semester ${semNumberStr}` });
	await ctx.api.deleteMessage(ctx.chat!.id, loadingMsg.message_id);
}

async function fetchAndCache(ctx: BotContext, db: DB, stynumber: number, r2Key: string): Promise<ArrayBuffer> {
	const service = new SoaPService(ctx.auth!.user!.password);
	const pdfBuffer = await service.getSemesterResultPdf(ctx.auth!.token!, stynumber);

	try {
		// await ctx.r2.put(r2Key, pdfBuffer, { httpMetadata: { contentType: "application/pdf" } });
		// await db
		// 	.update(results)
		// 	.set({ doc: r2Key })
		// 	.where(and(eq(results.userId, ctx.auth!.user!.id), eq(results.sem, stynumber)));
	} catch (err) {
		console.error("Failed to cache PDF to R2");
		throw err;
	}

	return pdfBuffer;
}
