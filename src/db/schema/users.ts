import { sql } from "drizzle-orm";
import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createId } from "./helper";

export const users = sqliteTable("users", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => createId()),
	name: text("name").notNull(),
	regNo: text("reg_no").notNull().unique(),
	gender: text("gender", { enum: ["male", "female", "other"] }).notNull(),
	dob: text("dob").notNull(),
	program: text("program").notNull(),
	branch: text("branch").notNull(),
	admissionYear: text("admission_year").notNull(),
	category: text("category").notNull(),
	phone: text("phone").notNull(),
	email: text("email").notNull(),
	createdAt: text("created_at")
		.notNull()
		.default(sql`(datetime('now'))`),
	updatedAt: text("updated_at")
		.notNull()
		.default(sql`(datetime('now'))`)
		.$onUpdateFn(() => new Date().toISOString()),
	deletedAt: text("deleted_at"),
});
