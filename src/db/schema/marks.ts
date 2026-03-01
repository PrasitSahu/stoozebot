import { real, sqliteTable, text, unique } from "drizzle-orm/sqlite-core";
import { createId } from "./helper";
import { users } from "./users";

export const marks = sqliteTable(
	"marks",
	{
		id: text("id")
			.primaryKey()
			.$defaultFn(() => createId()),
		userId: text("user_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		sem: text("sem").notNull(),
		sgpa: real("sgpa").notNull(),
		cgpa: real("cgpa").notNull(),
	},
	(table) => [unique().on(table.userId, table.sem)],
);
