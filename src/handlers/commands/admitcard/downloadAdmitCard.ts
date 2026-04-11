import { InputFile } from "grammy";
import { BotContext } from "../../../config";
import { Err, ReplyNoAuth } from "../../../constants";
import SoaPService, { AdmitCardPayload } from "../../../services/soaPortals";
import { handleErrors } from "../../errorHandler";

export async function downloadAdmitCard(ctx: BotContext) {
	try {
		if (!ctx.auth?.user || !ctx.auth.token || !ctx.match) {
			await ctx.reply(ReplyNoAuth, {
				parse_mode: "Markdown",
			});
			return;
		}

		const regId = ctx.match[1];
		const examId = ctx.match[2];

		await ctx.answerCallbackQuery();
		await ctx.editMessageText("Downloading your admit card PDF...");
		await ctx.replyWithChatAction("upload_document");

		const soaPortalService = new SoaPService(ctx.auth.user.password);
		const metaDataRes = await soaPortalService.getAdmitCardMetaData(ctx.auth.token);

		if (metaDataRes.status.responseStatus !== "Success") {
			throw new Error(Err.ErrFailRes);
		}

		const studentInfo = metaDataRes.response.studentInfo[0];
		if (!studentInfo) {
			throw new Error(Err.ErrFormat);
		}

		const payload: AdmitCardPayload = {
			instituteid: studentInfo.instituteid,
			registrationid: regId,
			exameventid: examId,
			enrollmentno: studentInfo.enrollmentno,
			studentname: studentInfo.name,
			programmdesc: studentInfo.programdesc,
			branchdesc: studentInfo.branchdesc,
		};

		const pdfBuffer = await soaPortalService.downloadAdmitCardPdf(ctx.auth.token, payload);
		const file = new InputFile(Buffer.from(pdfBuffer), `AdmitCard_${studentInfo.enrollmentno}.pdf`);

		await ctx.editMessageMedia({ type: "document", media: file, caption: `Here is your Admit Card 😊` });
	} catch (error) {
		console.error("Error downloading admit card PDF");
		await handleErrors(ctx, error);
	}
}
