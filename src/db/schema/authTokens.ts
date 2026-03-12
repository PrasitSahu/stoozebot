import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createId } from "./helper";
import { users } from "./users";
import { sql } from "drizzle-orm";

export const authTokens = sqliteTable("auth_tokens", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => createId()),
	userId: text("user_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" })
		.unique(),
	token: text("token"),
	updatedAt: text("updated_at")
		.notNull()
		.default(sql`(datetime('now'))`)
		.$onUpdateFn(() => new Date().toISOString()),
});
