import { InferInsertModel } from "drizzle-orm";
import { SQLiteTransaction } from "drizzle-orm/sqlite-core";
import { DB } from "../../config";
import { authTokens, platformUsers, users } from "../../db";
import { createId } from "../../db/schema/helper";

type Tx = SQLiteTransaction<"async", D1Result<unknown>, any, any>;

export enum Platform {
	Telegram = "telegram",
}

export async function createUser(db: DB, user: InferInsertModel<typeof users>, platformId: string, authToken: string) {
	const newId = createId();
	user.id = newId;
	await db.batch([
		db.insert(users).values(user),
		db.insert(authTokens).values({ userId: newId, token: authToken }),
		db.insert(platformUsers).values({ userId: newId, platform: Platform.Telegram, platformId: platformId }).onConflictDoUpdate({
			target: platformUsers.platformId,
			set: { userId: newId },
		}),
	]);
}

export async function createPlatformUser(db: DB, id: string, platformId: string) {
	await db.insert(platformUsers).values({ userId: id, platform: Platform.Telegram, platformId: platformId }).onConflictDoUpdate({
		target: platformUsers.platformId,
		set: { userId: id },
	});
}
