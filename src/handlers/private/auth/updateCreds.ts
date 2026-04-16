import { Composer } from "grammy";
import { BotContext, DB } from "../../../config";
import { Err, ReplyNoAuth, UpdateCredsRegex } from "../../../constants";
import soaPortals from "../../../services/soaPortals";
import { aesEnc } from "../../../utils";
import { handleErrors } from "../../errorHandler";
import { Platform, updateUserCreds } from "./user";

export function updateCreds(bot: Composer<BotContext>, db: DB) {
	bot.hears(UpdateCredsRegex, async (ctx: BotContext) => {
		const message = ctx.message?.text;
		if (!message) return;

		try {
			await ctx.deleteMessage();
		} catch (error) {
			// ignored
		}

		if (!ctx.auth?.user) {
			await ctx.reply(ReplyNoAuth);
			return;
		}

		if (ctx.chat?.type === "private") {
			const chatId = ctx.chat.id.toString();

			const match = message.match(UpdateCredsRegex);

			if (!match) {
				await ctx.reply("❌ Invalid format. Use: #updatecreds REGNO_PASSWORD");
				return;
			}

			const regNoInp = match[1].toUpperCase();
			const password = match[2];

			if (ctx.auth.user.regNo !== regNoInp) {
				await ctx.reply("❌ Unauthorized to update this account's credentials.");
				return;
			}

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
				await ctx.reply("❌ User not found. Please log in first using \`#login REGNO_PASSWORD\`", { parse_mode: "Markdown" });
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
					await ctx.reply("❌ Invalid credentials.");
					return;
				}

				const regdata = userData.response.regdata;
				if (!regdata) {
					console.error("failed to detect data format for regdata in 'genToken' response");
					throw new Error(Err.ErrFormat);
				}

				await updateUserCreds(db, user.id, passToken, regdata.token);
			} catch (error: unknown) {
				await handleErrors(ctx, error as Error);
				return;
			}

			await ctx.reply("✅ Credentials updated successfully.");
		}
	});
}
