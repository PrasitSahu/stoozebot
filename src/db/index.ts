import { relations } from "drizzle-orm";
import { users } from "./schema/users";
import { attendances } from "./schema/attendances";
import { platformUsers } from "./schema/platformUsers";
import { marks } from "./schema/marks";
import { authTokens } from "./schema/authTokens";

export const usersRelations = relations(users, ({ one, many }) => ({
	attendances: many(attendances),
	platformUsers: many(platformUsers),
	marks: many(marks),
	authToken: one(authTokens, {
		fields: [users.id],
		references: [authTokens.userId],
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
export * from "./schema/authTokens";
