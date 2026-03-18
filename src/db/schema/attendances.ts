import { sql } from "drizzle-orm";
import { integer, sqliteTable, text, unique } from "drizzle-orm/sqlite-core";
import { createId } from "./helper";
import { users } from "./users";

export const attendances = sqliteTable(
	"attendances",
	{
		id: text("id")
			.primaryKey()
			.$defaultFn(() => createId()),
		userId: text("user_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		slNo: integer("slno").notNull(),
		percentage: text("percentage").notNull(),
		total: text("total").notNull(),
		subject: text("subject").notNull(),
		subjectCode: text("subject_code").notNull(),
		sem: text("sem").notNull(),
		regCode: text("reg_code").notNull(),
		regId: text("reg_id").notNull(),
		updatedAt: text("updated_at")
			.notNull()
			.default(sql`(datetime('now'))`)
			.$onUpdateFn(() => sql`(datetime('now'))`),
	},
	(table) => [unique().on(table.userId, table.subjectCode, table.regCode, table.regId)],
);
