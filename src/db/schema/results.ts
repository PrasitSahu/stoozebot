import { real, sqliteTable, text, unique } from "drizzle-orm/sqlite-core";
import { createId } from "./helper";
import { users } from "./users";
import { sql } from "drizzle-orm";

export const results = sqliteTable(
	"results",
	{
		id: text("id")
			.primaryKey()
			.$defaultFn(() => createId()),
		userId: text("user_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		sem: real("sem").notNull(),
		sgpa: real("sgpa").notNull(),
		cgpa: real("cgpa").notNull(),
		prograde: real("prograde").notNull(),
		credits: real("credits").notNull(),
		doc: text("doc"),
		semDesc: text("sem_desc").notNull(),
		createdAt: text("created_at")
			.notNull()
			.default(sql`(datetime('now'))`),
		updatedAt: text("updated_at")
			.notNull()
			.default(sql`(datetime('now'))`)
			.$onUpdateFn(() => sql`(datetime('now'))`),
	},
	(table) => [unique().on(table.userId, table.sem)],
);
