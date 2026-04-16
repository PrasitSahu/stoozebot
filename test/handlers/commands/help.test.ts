import { describe, expect, test, vi } from "vitest";
import { help } from "../../../src/handlers/private/commands/help";
import { createMockContext } from "../../utils/mockContext";

describe("help command", () => {
	test("help replies with help message", async () => {
		const ctx = createMockContext();

		await help(ctx);

		expect(ctx.reply).toHaveBeenCalled();
		const payload = vi.mocked(ctx.reply).mock.calls[0][0];
		expect(payload).toContain("Available Commands");
	});
});
