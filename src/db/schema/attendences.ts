import { sql } from "drizzle-orm";
import { sqliteTable, text, integer, unique } from "drizzle-orm/sqlite-core";
import { createId } from "./helper";
import { users } from "./users";

export const attendences = sqliteTable(
	"attendences",
	{
		id: text("id")
			.primaryKey()
			.$defaultFn(() => createId()),
		userId: text("user_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		subject: text("subject").notNull(),
		present: integer("present").notNull().default(0),
		total: integer("total").notNull().default(0),
		updatedAt: text("updated_at")
			.notNull()
			.default(sql`(datetime('now'))`)
			.$onUpdateFn(() => new Date().toISOString()),
	},
	(table) => [unique().on(table.userId, table.subject)],
);
