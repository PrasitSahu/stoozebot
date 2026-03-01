import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createId } from "./helper";
import { sql } from "drizzle-orm";

export const apiLimits = sqliteTable("api_limits", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => createId()),
	platform: text("platform").notNull().unique(),
	reqs: integer("reqs").notNull().default(0),
	max: integer("max").notNull(),
	updatedAt: text("updated_at")
		.notNull()
		.default(sql`(datetime('now'))`)
		.$onUpdateFn(() => new Date().toISOString()),
});
