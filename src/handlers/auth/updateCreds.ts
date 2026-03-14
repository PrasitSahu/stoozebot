import { Bot } from "grammy";
import { BotContext, DB } from "../../config";
import { Err, ReplyInvalidFormat, ReplySomethingWentWrong } from "../../constants";
import soaPortals from "../../services/soaPortals";
import { aesEnc } from "../../utils";
import { Platform, updateUserCreds } from "./user";


export function updateCreds(bot: Bot<BotContext>, db: DB) {
	bot.hears(/#updatecreds\s+([A-Z0-9]+)_([^\s]+)/, async (ctx: BotContext) => {
		const message = ctx.message?.text;
		if (!message) return;

		if (ctx.chat?.type === "private") {
			const chatId = ctx.chat.id.toString();

			const pattern = /^#updatecreds\s+([A-Za-z0-9]+)_([^\s]+)$/;
			const match = message.match(pattern);

			if (!match) {
				await ctx.reply("❌ Invalid format. Use: #updatecreds REGNO_PASSWORD");
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

			if (!user) {
				await ctx.reply("❌ User not found. Please log in first using #login REGNO_PASSWORD");
				return;
			}

			if (!user.platformUsers.length) {
				await ctx.reply("❌ Unauthorized to update this account's credentials.");
				return;
			}

			const passToken = aesEnc({
				otppwd: "PWD",
				username: regNoInp,
				passwordotpvalue: password,
				Modulename: "STUDENTMODULE",
			});

			const soaPortalService = new soaPortals(passToken);
			try {
				const userData = await soaPortalService.genToken();
				if (userData?.status?.responseStatus !== "Success") {
					throw new Error(Err.ErrInvalidCred);
				}

				const regdata = userData?.response?.regdata;
				if (!regdata) {
					console.error("failed to detect data format for regdata in 'genToken' response");
					throw new Error(Err.ErrFormat);
				}

				await updateUserCreds(db, user.id, passToken, regdata.token);
			} catch (error: unknown) {
				if (error instanceof Error) {
					if (error.message === Err.ErrFormat) {
						await ctx.reply(ReplyInvalidFormat);
						return;
					}

					if (error.message === Err.ErrInvalidCred) {
						await ctx.reply("❌ Invalid credentials. Please try again.");
						return;
					}
				}
				console.log(error);
				await ctx.reply(ReplySomethingWentWrong);
				return;
			}

			await ctx.reply("✅ Credentials updated successfully.");
		}
	});
}
