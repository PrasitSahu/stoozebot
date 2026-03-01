import { Bot, webhookCallback } from "grammy";
import { BotContext } from "./config";
import developer from "./middlewares/developer";
import { registerCommands } from "./handlers/register";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "./db/index";
import { auth } from "./middlewares/auth";

export default {
	async fetch(request, env, ctx): Promise<Response> {
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
