import { InferInsertModel } from "drizzle-orm";
import { Composer } from "grammy";
import { BotContext, DB } from "@/config";
import { Err, Platform, ReplyDone, LoginRegex, SecurityMode, DefaultPassword } from "@/constants";
import { users } from "@/db";
import soaPortals from "@/services/soaPortals";
import { aesEnc } from "@/utils";
import { handleErrors } from "@/handlers/errorHandler";
import { createPlatformUser, createUser, updateUserCreds } from "./user";
// import jwt, { JwtPayload } from "jsonwebtoken";
// import z from "zod";

export function login(bot: Composer<BotContext>, db: DB) {
	bot.hears(LoginRegex, async (ctx: BotContext) => {
		const message = ctx.message?.text;
		if (!message || !ctx.chat) return;

		try {
			await ctx.deleteMessage();
		} catch (error) {
			// ignored
		}

		try {
			if (!!ctx.auth?.user) {
				if (ctx.auth.user.password !== DefaultPassword) {
					await ctx.reply("✅ Already logged in");
					return;
				} else {
					if (ctx.auth.securityMode === SecurityMode.Privacy && ctx.auth.token) {
						// const payload = z.string().safeParse(ctx.auth.token);
						// if (payload.success) {
						// 	const decode = jwt.decode(payload.data) as JwtPayload;
						// 	if (decode?.exp) {
						// 		const d = new Date(decode.exp * 1000).getTime() - Date.now();
						// 		const hr = Math.floor(d / 1000 / 60 / 60);
						// 		const min = Math.floor((d / 1000 / 60) % 60);
						// 		const sec = Math.floor((d / 1000) % 60);
						// 		if (d > 0) {
						// 			// Session expires in ${hr}h ${min}m ${sec}s
						// 		}
						// 	}

						// }
						const reply = `✅ Already logged in`;
						await ctx.reply(reply);
						return;
					}
				}
			}

			const chatId = ctx.chat.id.toString();

			const match = message.match(LoginRegex);

			if (!match) {
				await ctx.reply("❌ Invalid format. Use: #login REGNO_PASSWORD");
				return;
			}

			const msg = await ctx.reply("⏳ Verifying credentials...");
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

			const securityMode = user?.platformUsers?.[0]?.securityMode || SecurityMode.Privacy;
			const passToken = aesEnc({
				otppwd: "PWD",
				username: regNoInp,
				passwordotpvalue: password,
				Modulename: "STUDENTMODULE",
			});

			const storagePassword = securityMode === SecurityMode.Privacy ? DefaultPassword : passToken;

			const soaPortalService = new soaPortals(passToken);

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
					await ctx.api.editMessageText(ctx.chat.id, msg.message_id, "failed to fetch user data.", {});
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
					password: storagePassword,
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
				await updateUserCreds(db, user.id, storagePassword, regdata.token);
				await createPlatformUser(db, user.id, ctx.chat.id.toString());
			}
			await ctx.api.editMessageText(ctx.chat.id, msg.message_id, ReplyDone, {});
		} catch (error: unknown) {
			await handleErrors(ctx, error as Error);
		}
	});
}
