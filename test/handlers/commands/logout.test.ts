import { describe, expect, test, vi } from "vitest";
import { logout } from "../../../src/handlers/commands/logout";
import { createMockContext } from "../../utils/mockContext";
import { createMockDb } from "../../utils/mockDb";

describe("logout command", () => {
	test("logout command updates db and replies done", async () => {
		const ctx = createMockContext();
		const db = createMockDb();

		await logout(ctx, db);

		expect(db.update).toHaveBeenCalled();
		expect(ctx.reply).toHaveBeenCalled();
	});
});
