import { sql } from "drizzle-orm";
import { sqliteTable, text, unique } from "drizzle-orm/sqlite-core";
import { createId } from "./helper";
import { users } from "./users";

export const timetables = sqliteTable(
	"timetables",
	{
		id: text("id")
			.primaryKey()
			.$defaultFn(() => createId()),
		userId: text("user_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		regCode: text("reg_code").notNull(),
		regId: text("reg_id").notNull(),
		data: text("data").notNull(), // JSON string of TimetableResponse
		updatedAt: text("updated_at")
			.notNull()
			.default(sql`(datetime('now'))`)
			.$onUpdateFn(() => sql`(datetime('now'))`),
	},
	(table) => [unique().on(table.userId, table.regId)],
);
