import { eq, InferInsertModel } from "drizzle-orm";
import { BotContext, DB } from "../../../config";
import { InlineKeyboard } from "grammy";
import { results } from "../../../db/schema/results";
import { Err, ReplyNoAuth, ReplySiteDown } from "../../../constants";
import { handleErrors } from "../../errorHandler";
import SoaPService, { SemesterData } from "../../../services/soaPortals";

export async function result(ctx: BotContext, db: DB) {
	try {
		if (!ctx.auth || !ctx.auth.user || !ctx.auth.token) {
			await ctx.reply(ReplyNoAuth, {
				parse_mode: "Markdown",
			});
			return;
		}

		let btns: InlineKeyboard | null = null;

		await ctx.replyWithChatAction("typing");

		let semData: SemesterData[] = [];

		const soaPService = new SoaPService(ctx.auth.user.password);
		try {
			const semDataResp = await soaPService.getAllSemesterData(ctx.auth.token);
			if (semDataResp?.status?.responseStatus !== "Success") {
				console.error("failed to fetch sem data");
				throw new Error(Err.ErrFailRes);
			}

			semData = semDataResp.response.semesterList;
			if (!semData) {
				console.error("failed to detect response format for semData");
				throw new Error(Err.ErrFormat);
			}

			if (semData.length > 0) {
				const insertData: InferInsertModel<typeof results>[] = semData.map((s) => ({
					userId: ctx.auth!.user!.id,
					sem: s.stynumber,
					sgpa: s.sgpa,
					cgpa: s.cgpa,
					prograde: s.prograde,
					semDesc: s.semesterDesc,
					credits: s.totalearnedcredits,
				}));

				await db
					.insert(results)
					.values(insertData)
					.onConflictDoUpdate({
						target: [results.userId, results.sem],
						set: {
							sgpa: results.sgpa,
							cgpa: results.cgpa,
							prograde: results.prograde,
							semDesc: results.semDesc,
							credits: results.credits,
						},
					});
			}

			btns = InlineKeyboard.from([...semData.map((s) => [InlineKeyboard.text(s.semesterDesc, `#result ${s.stynumber}`)])]);
		} catch (error) {
			if (error instanceof Error) {
				if (error.message === Err.ErrReqFail || error.message === Err.ErrFormat) {
					const cachedMarks = await db.query.results.findMany({
						where: eq(results.userId, ctx.auth.user.id),
					});
					console.log(cachedMarks);
					btns = InlineKeyboard.from([...cachedMarks.map((m) => [InlineKeyboard.text(m.semDesc, `#result ${m.sem}`)])]);
				}
			} else {
				console.error("Error generating pdf");
				return await handleErrors(ctx, error);
			}
		}

		if (!btns) {
			await ctx.reply(ReplySiteDown);
			return;
		}

		await ctx.reply("select your semester", {
			reply_markup: btns,
		});
	} catch (error) {
		console.error("Error fetching marks:", error);
		await handleErrors(ctx, error as Error);
	}
}
