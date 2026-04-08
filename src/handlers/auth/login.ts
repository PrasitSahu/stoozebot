import { InferInsertModel } from "drizzle-orm";
import { Bot } from "grammy";
import { BotContext, DB } from "../../config";
import { Err, ReplyDone, LoginRegex } from "../../constants";
import { users } from "../../db";
import soaPortals from "../../services/soaPortals";
import { aesEnc } from "../../utils";
import { handleErrors } from "../errorHandler";
import { Platform, createPlatformUser, createUser, updateUserCreds } from "./user";

export function login(bot: Bot<BotContext>, db: DB) {
	bot.hears(LoginRegex, async (ctx: BotContext) => {
		const message = ctx.message?.text;
		if (!message) return;

		try {
			await ctx.deleteMessage();
		} catch (error) {
			// ignored
		}

		if (ctx.chat?.type === "private") {
			if (!!ctx.auth?.user) {
				await ctx.reply("✅ Already logged in");
				return;
			}

			const chatId = ctx.chat.id.toString();

			const match = message.match(LoginRegex);

			if (!match) {
				await ctx.reply("❌ Invalid format. Use: #login REGNO_PASSWORD");
				return;
			}

			const regNoInp = match[1].toUpperCase();
			const password = match[2];

			const user = await db.query.users.findFirst({
				where({ regNo }, { eq }) {
					return eq(regNo, regNoInp);
				},
				with: {
					platformUsers: {
						where({ platform, platformId }, { eq, and }) {
							return and(eq(platformId, chatId), eq(platform, Platform.Telegram));
						},
						limit: 1,
					},
				},
			});
			const passToken = aesEnc({
				otppwd: "PWD",
				username: regNoInp,
				passwordotpvalue: password,
				Modulename: "STUDENTMODULE",
			});

			const soaPortalService = new soaPortals(passToken);
			try {
				if (!user) {
					const userData = await soaPortalService.genToken();
					if (userData.status.responseStatus !== "Success") {
						throw new Error(Err.ErrInvalidCred);
					}

					const regdata = userData.response.regdata;
					if (!regdata) {
						console.error("failed to detect data format for regdata in 'genToken' response");
						throw new Error(Err.ErrFormat);
					}

					const studentInfo = await soaPortalService.getPersonalInfo(regdata.token);
					if (studentInfo.status.responseStatus !== "Success") {
						await ctx.reply("failed to fetch user data.");
						return;
					}

					const generalInfo = studentInfo.response.generalinformation;
					if (!generalInfo) {
						console.error("failed to detect data format for generalInfo in 'getPersonalInfo' response");
						throw new Error(Err.ErrFormat);
					}

					const newUser: InferInsertModel<typeof users> = {
						name: regdata.name,
						regNo: generalInfo.registrationno,
						password: passToken,
						gender: generalInfo.gender,
						dob: regdata.userDOB,
						program: generalInfo.programcode,
						branch: generalInfo.branch,
						admissionYear: generalInfo.admissionyear,
						category: generalInfo.category,
						email: generalInfo.studentpersonalemailid,
						phone: generalInfo.studentcellno,
					};
					await createUser(db, newUser, chatId, regdata.token);
				} else {
					// check for password with a token request, if it works then update the same
					const userData = await soaPortalService.genToken();
					if (userData?.status?.responseStatus !== "Success") {
						throw new Error(Err.ErrInvalidCred);
					}

					const regdata = userData.response.regdata;
					if (!regdata) {
						console.error("failed to detect data format for regdata in 'genToken' response");
						throw new Error(Err.ErrFormat);
					}
					await updateUserCreds(db, user.id, passToken, regdata.token);
					await createPlatformUser(db, user.id, ctx.chat.id.toString());
				}
			} catch (error: unknown) {
				await handleErrors(ctx, error as Error);
				return;
			}

			await ctx.reply(ReplyDone);
		}
	});
}
