import { drizzle } from "drizzle-orm/d1";
import { Bot, webhookCallback } from "grammy";
import { BotContext } from "./config";
import * as schema from "./db/index";
import { registerCommands } from "./handlers/register";
import { auth } from "./middlewares/auth";
import developer from "./middlewares/developer";

function verifyBot(secret: string) {
	return secret === process.env.BOT_SECRET;
}

export default {
	async fetch(request, env, ctx): Promise<Response> {
		if (!verifyBot(request.headers.get("X-Telegram-Bot-Api-Secret-Token") || "")) {
			return new Response("Bad Request", { status: 400 });
		}

		const bot = new Bot<BotContext>(env.BOT_TOKEN);
		const db = drizzle(env.DB, {
			schema,
		});

		bot.use(developer);
		bot.use(auth(db));

		registerCommands(bot, db);

		return webhookCallback(bot, "cloudflare-mod")(request);
	},
} satisfies ExportedHandler<Env>;
