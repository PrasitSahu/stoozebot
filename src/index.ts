export { BotThrottler } from "./BotThrottler";
import { drizzle } from "drizzle-orm/d1";
import { Bot, webhookCallback } from "grammy";
import { BotContext } from "./config";
import * as schema from "./db/index";
import { registerAuth, registerCommands, setCommandList } from "./handlers/register";
import { auth } from "./middlewares/auth";
import { manageToken } from "./middlewares/authToken";
import developer from "./middlewares/developer";
import { botApiLimit, limits } from "./middlewares/limits";
import { privacyTOS } from "./middlewares/privayToS";

let isCold = true;
let isEnvChecked = false;
export const setEnvChecked = (value: boolean) => (isEnvChecked = value);

export const REQUIRED_ENV_VARS = [
	"APP_URL",
	"PAGES_URL",
	"BOT_TOKEN",
	"BOT_SECRET",
	"BOT_LIMIT",
	"BOT_DEVELOPER",
	"BOT_NEWS_CHANNEL",
	"KEY",
	"IV",
	"PROXY",
	"PROXY_SIGNATURE",
	"CLIENT_ID",
	"INSTITUTE_ID",
	"LIMIT_PER_DAY",
];

export function checkEnv() {
	if (isEnvChecked) return;

	const missing = REQUIRED_ENV_VARS.filter((key) => !process.env[key]);
	if (missing.length > 0) {
		const errorMsg = `❌ Missing environment variables: ${missing.join(", ")}`;
		console.error(errorMsg);
		throw new Error(errorMsg);
	}

	isEnvChecked = true;
}

function verifyBot(secret: string) {
	return secret === process.env.BOT_SECRET;
}

export default {
	async fetch(request, env, ctx): Promise<Response> {
		checkEnv();

		if (!verifyBot(request.headers.get("X-Telegram-Bot-Api-Secret-Token") || "")) {
			return new Response("Bad Request", { status: 400 });
		}

		const bot = new Bot<BotContext>(env.BOT_TOKEN);
		if (isCold) {
			try {
				await bot.init();
				await setCommandList(bot);
			} catch (error) {}
			isCold = false;
		}

		const db = drizzle(env.DB!, {
			schema,
		});

		// middlewares
		bot.use(developer);
		bot.use(auth(db));
		bot.use(privacyTOS);
		bot.use(limits);
		bot.use(manageToken(db));
		bot.use(botApiLimit(env));

		registerAuth(bot, db);
		registerCommands(bot, db);

		return webhookCallback(bot, "cloudflare-mod")(request);
	},
} satisfies ExportedHandler<Env>;
