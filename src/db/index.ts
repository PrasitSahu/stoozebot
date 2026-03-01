import { relations } from "drizzle-orm";
import { users } from "./schema/users";
import { userLimits } from "./schema/userLimits";
import { attendences } from "./schema/attendences";
import { platformUsers } from "./schema/platformUsers";
import { marks } from "./schema/marks";

export const usersRelations = relations(users, ({ one, many }) => ({
	userLimits: one(userLimits, {
		fields: [users.id],
		references: [userLimits.userId],
	}),
	attendences: many(attendences),
	platformUsers: many(platformUsers),
	marks: many(marks),
}));

export const userLimitsRelations = relations(userLimits, ({ one }) => ({
	user: one(users, {
		fields: [userLimits.userId],
		references: [users.id],
	}),
}));

export const attendencesRelations = relations(attendences, ({ one }) => ({
	user: one(users, {
		fields: [attendences.userId],
		references: [users.id],
	}),
}));

export const platformUsersRelations = relations(platformUsers, ({ one }) => ({
	user: one(users, {
		fields: [platformUsers.userId],
		references: [users.id],
	}),
}));

export const marksRelations = relations(marks, ({ one }) => ({
	user: one(users, {
		fields: [marks.userId],
		references: [users.id],
	}),
}));

export * from "./schema/users";
export * from "./schema/apiLimits";
export * from "./schema/attendences";
export * from "./schema/platformUsers";
export * from "./schema/marks";
export * from "./schema/userLimits";
