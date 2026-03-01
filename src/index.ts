import { Bot, webhookCallback } from "grammy";

export default {
	async fetch(request, env, ctx): Promise<Response> {
		const bot = new Bot(env.BOT_TOKEN);
		return webhookCallback(bot, "cloudflare-mod")(request);
	},
} satisfies ExportedHandler<Env>;
