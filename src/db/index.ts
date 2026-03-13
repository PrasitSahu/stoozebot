import { relations } from "drizzle-orm";
import { users } from "./schema/users";
import { userLimits } from "./schema/userLimits";
import { attendances } from "./schema/attendances";
import { platformUsers } from "./schema/platformUsers";
import { marks } from "./schema/marks";
import { authTokens } from "./schema/authTokens";

export const usersRelations = relations(users, ({ one, many }) => ({
	userLimits: one(userLimits, {
		fields: [users.id],
		references: [userLimits.userId],
	}),
	attendances: many(attendances),
	platformUsers: many(platformUsers),
	marks: many(marks),
}));

export const userLimitsRelations = relations(userLimits, ({ one }) => ({
	user: one(users, {
		fields: [userLimits.userId],
		references: [users.id],
	}),
}));

export const attendancesRelations = relations(attendances, ({ one }) => ({
	user: one(users, {
		fields: [attendances.userId],
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

export const authTokenRelations = relations(authTokens, ({ one }) => ({
	user: one(users, {
		fields: [authTokens.userId],
		references: [users.id],
	}),
}));

export * from "./schema/users";
export * from "./schema/apiLimits";
export * from "./schema/attendances";
export * from "./schema/platformUsers";
export * from "./schema/marks";
export * from "./schema/userLimits";
export * from "./schema/authTokens";
