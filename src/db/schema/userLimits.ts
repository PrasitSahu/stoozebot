import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createId } from "./helper";
import { sql } from "drizzle-orm";
import { users } from "./users";

export const userLimits = sqliteTable("user_limits", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => createId()),
	userId: text("user_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	reqs: integer("reqs").notNull().default(0),
	max: integer("max").notNull(),
	updatedAt: text("updated_at")
		.notNull()
		.default(sql`(datetime('now'))`)
		.$onUpdateFn(() => new Date().toISOString()),
});
