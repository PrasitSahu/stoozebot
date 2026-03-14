import { InferSelectModel } from "drizzle-orm";
import { DrizzleD1Database } from "drizzle-orm/d1";
import { Context } from "grammy";
import * as schema from "./db/index";

export interface Config {
	botDeveloper: number;
	isBotDeveloper: boolean;
}

export interface Auth {
	user: InferSelectModel<typeof schema.users> | null;
	reqs: number;
}

export interface BotContext extends Context {
	config: Config;
	auth: Auth | null;
}

export type DB = DrizzleD1Database<typeof schema> & {
	$client: D1Database;
};
