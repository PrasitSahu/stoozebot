import { DrizzleD1Database } from "drizzle-orm/d1";
import { Bot, Context } from "grammy";
import * as schema from "./db/index";
import { InferSelectModel } from "drizzle-orm";

export interface Config {
	botDeveloper: number;
	isBotDeveloper: boolean;
}

export interface Auth {
	telegramUser: InferSelectModel<typeof schema.platformUsers> | null;
}

export interface BotContext extends Context {
	config: Config;
	auth: Auth;
}

export type DB = DrizzleD1Database<typeof schema> & {
	$client: D1Database;
};
