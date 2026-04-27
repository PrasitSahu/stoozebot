import { relations } from "drizzle-orm";
import { users } from "./schema/users";
import { attendances } from "./schema/attendances";
import { platformUsers } from "./schema/platformUsers";
import { results } from "./schema/results";
import { authTokens } from "./schema/authTokens";
import { timetables } from "./schema/timetables";

export const usersRelations = relations(users, ({ one, many }) => ({
	attendances: many(attendances),
	platformUsers: many(platformUsers),
	marks: many(results),
	timetables: many(timetables),
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

export const marksRelations = relations(results, ({ one }) => ({
	user: one(users, {
		fields: [results.userId],
		references: [users.id],
	}),
}));

export const timetablesRelations = relations(timetables, ({ one }) => ({
	user: one(users, {
		fields: [timetables.userId],
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
export * from "./schema/results";
export * from "./schema/authTokens";
export * from "./schema/timetables";
