import { sqliteTable, text, unique } from "drizzle-orm/sqlite-core";
import { createId } from "./helper";
import { users } from "./users";
import { sql } from "drizzle-orm";

export const platformUsers = sqliteTable(
	"platform_users",
	{
		id: text("id")
			.primaryKey()
			.$defaultFn(() => createId()),
		userId: text("user_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		platform: text().notNull(),
		platformId: text("platform_id").notNull(),
		createdAt: text("created_at")
			.notNull()
			.default(sql`(datetime('now'))`),
	},
	(table) => [unique().on(table.userId, table.platform, table.platformId)],
);
