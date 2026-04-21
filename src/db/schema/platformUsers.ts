import { integer, sqliteTable, text, unique } from "drizzle-orm/sqlite-core";
import { createId } from "./helper";
import { users } from "./users";
import { sql } from "drizzle-orm";
import { SecurityMode } from "@/constants";

export const platformUsers = sqliteTable(
	"platform_users",
	{
		id: text("id")
			.primaryKey()
			.$defaultFn(() => createId()),
		userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),
		platform: text().notNull(),
		platformId: text("platform_id").notNull(),
		securityMode: text("security_mode").notNull().default(SecurityMode.Convenience),
		reqs: integer("reqs").notNull().default(0),
		lastReqAt: text("last_req_at")
			.notNull()
			.default(sql`(datetime('now'))`),
		createdAt: text("created_at")
			.notNull()
			.default(sql`(datetime('now'))`),
	},
	(table) => [unique().on(table.platform, table.platformId)],
);
