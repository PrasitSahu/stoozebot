import { InferInsertModel } from "drizzle-orm";
import { Bot } from "grammy";
import { BotContext, DB } from "../../config";
import { Err, ReplyInvalidCreds, ReplyInvalidFormat, ReplySomethingWentWrong } from "../../constants";
import { users } from "../../db";
import soaPortals from "../../services/soaPortals";
import { aesEnc } from "../../utils";
import { createPlatformUser, createUser, Platform } from "./user";

export function login(bot: Bot<BotContext>, db: DB) {
	bot.hears(/#login\s+([0-9]+)_([^\s]+)/, async (ctx: BotContext) => {
		const message = ctx.message?.text;
		if (!message) return;

		if (ctx.chat?.type === "private") {
			if (!!ctx.auth?.user) {
				await ctx.reply("✅ Already logged in");
				return;
			}

			const chatId = ctx.chat.id.toString();

			const pattern = /^#login\s+([A-Za-z0-9]+)_([^\s]+)$/;
			const match = message.match(pattern);

			if (!match) {
				await ctx.reply("❌ Invalid format. Use: #login REGNO_PASSWORD");
				return;
			}

			const regNoInp = match[1];
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
					if (userData?.status?.responseStatus !== "Success") {
						// TODO: fix this with update password for change in password
						throw new Error(Err.ErrInvalidCred);
					}

					const regdata = userData?.response?.regdata;
					if (!regdata) {
						console.error("failed to detect data format for regdata in 'genToken' response");
						throw new Error(Err.ErrFormat);
					}

					const studentInfo = await soaPortalService.getPersonalInfo(regdata.token);
					if (studentInfo?.status?.responseStatus !== "Success") {
						await ctx.reply("failed to fetch user data.");
						return;
					}

					const generalInfo = studentInfo?.response?.generalinformation;
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
				} else if (!user.platformUsers.length) {
					await createPlatformUser(db, user.id, chatId);
				}
			} catch (error: unknown) {
				if (error instanceof Error) {
					if (error.message === Err.ErrFormat) {
						await ctx.reply(ReplyInvalidFormat);
						return;
					}

					if (error.message === Err.ErrInvalidCred) {
						await ctx.reply(ReplyInvalidCreds);
						return;
					}
				}
				console.log(error);
				await ctx.reply(ReplySomethingWentWrong);
				return;
			}

			await ctx.reply("✅ Done");
		}
	});
}
