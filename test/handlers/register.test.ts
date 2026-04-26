import { Bot } from "grammy";
import { createMockDB } from "test/utils/mockDB";
import { describe, test } from "vitest";
import { BotContext } from "../../src/config";
import { registerCommands } from "../../src/handlers/register";

export const bot = new Bot<BotContext>("testToken", {
	botInfo: {
		is_bot: true,
		username: "",
		can_join_groups: false,
		can_read_all_group_messages: false,
		supports_inline_queries: false,
		can_connect_to_business: false,
		has_main_web_app: false,
		has_topics_enabled: false,
		allows_users_to_create_topics: false,
		id: 0,
		first_name: "",
	},
});
const db = createMockDB();

registerCommands(bot, db);

describe("register", () => {
	test("registers commands", () => {});
});
