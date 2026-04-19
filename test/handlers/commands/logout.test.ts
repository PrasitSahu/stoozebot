import { describe, expect, test, vi } from "vitest";
import { logout } from "../../../src/handlers/private/commands/logout";
import { createMockContext } from "../../utils/mockContext";
import { createMockDB } from "../../utils/mockDB";

describe("logout command", () => {
	test("logout command updates db and replies done", async () => {
		const ctx = createMockContext();
		const db = createMockDB();

		await logout(ctx, db);

		expect(db.update).toHaveBeenCalled();
		expect(ctx.reply).toHaveBeenCalled();
	});
});
