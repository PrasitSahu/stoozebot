import { eq, InferInsertModel } from "drizzle-orm";
import { BotContext, DB } from "../../../config";
import { InlineKeyboard } from "grammy";
import { results } from "../../../db/schema/results";
import { Err, ReplyNoAuth } from "../../../constants";
import { handleErrors } from "../../errorHandler";
import SoaPService, { SemesterData } from "../../../services/soaPortals";

// export async function fetchAndStoreMarks(
// 	db: DB,
// 	passToken: string,
// 	authToken: string,
// 	userId: string,
// ): Promise<SemesterData[]> {
// 	const service = new soaPService(passToken);
// 	const res = await service.getAllSemesterData(authToken);

// 	if (res?.status?.responseStatus !== "Success") {
// 		console.error("failed to fetch semester data from soa: ", res);
// 		throw new Error(Err.ErrFailRes);
// 	}

// 	const semData = res?.response?.semesterList;
// 	if (!semData) {
// 		throw new Error(Err.ErrFormat);
// 	}

// 	if (semData.length > 0) {
// 		const insertData: InferInsertModel<typeof marks>[] = semData.map((s) => ({
// 			userId,
// 			sem: s.stynumber,
// 			sgpa: s.sgpa,
// 			cgpa: s.cgpa,
// 			prograde: s.prograde,
// 			semDesc: s.semesterDesc,
// 			credits: s.totalearnedcredits,
// 			doc: JSON.stringify(s),
// 		}));

// 		await db.insert(marks).values(insertData).onConflictDoNothing();
// 	}

// 	return semData;
// }

export async function result(ctx: BotContext, db: DB) {
	if (!ctx.auth || !ctx.auth.user || !ctx.auth.token) {
		try {
			await ctx.reply(ReplyNoAuth, {
				parse_mode: "Markdown",
			});
		} catch (error) {
			console.error("Error fetching marks:", error);
		}
		return;
	}

	let btns: InlineKeyboard;

	try {
		const loadingMsg = await ctx.reply("Fetching your result data...", {
			reply_parameters: { message_id: ctx.msgId! },
		});
		let semData: SemesterData[] = [];

		const soaPService = new SoaPService(ctx.auth.user.password);
		try {
			const semDataResp = await soaPService.getAllSemesterData(ctx.auth.token);
			if (semDataResp?.status?.responseStatus !== "Success") {
				console.error("failed to fetch sem data");
				throw new Error(Err.ErrFailRes);
			}

			semData = semDataResp?.response?.semesterList;
			if (!semData) {
				console.error("failed to detect response format for semData");
				throw new Error(Err.ErrFormat);
			}

			InlineKeyboard;
			btns = InlineKeyboard.from([...semData.map((s) => [InlineKeyboard.text(s.semesterDesc, `#result ${s.stynumber}`)])]);
		} catch (error) {
			// if (error instanceof Error) {
			// 	if (error.message === Err.ErrReqFail || error.message === Err.ErrFormat) {
			// 		// check for cached data
			// 		const cachedMarks = await db.query.results.findMany({
			// 			where: eq(results.userId, ctx.auth.user.id),
			// 		});
			// 		btns = InlineKeyboard.from([...cachedMarks.map((m) => [InlineKeyboard.text(m.semDesc, `#result ${m.sem}`)])]);
			// 	}
			// }
			throw error;
		}

		if (semData.length === 0) {
			await ctx.api.editMessageText(ctx.chat!.id, loadingMsg.message_id, "No semester records found.");
			return;
		}

		await ctx.api.editMessageText(ctx.chat!.id, loadingMsg.message_id, "select your semester", {
			reply_markup: btns,
		});
	} catch (error) {
		console.error("Error fetching marks:", error);
		await handleErrors(ctx, error as Error);
	}
}
