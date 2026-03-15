import { describe, expect, test, vi, beforeEach } from "vitest";
import { attendance } from "../../../../src/handlers/commands/attendance/listSem";
import { createMockContext } from "../../../utils/mockContext";
import { createMockDb } from "../../../utils/mockDb";

vi.mock("../../../../src/services/soaPortals", () => {
	return {
		default: vi.fn().mockImplementation(() => ({
			getAttendanceSemList: vi.fn().mockResolvedValue({
				status: { responseStatus: "Success" },
				response: {
					semlist: [
						{ registrationcode: "SEM1", registrationid: "123" },
						{ registrationcode: "SEM2", registrationid: "124" },
					],
				},
			}),
		})),
	};
});

describe("attendance (listSem) command", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	test("replies with no auth if user is missing", async () => {
		const ctx = createMockContext({ auth: null });
		const db = createMockDb();

		await attendance(ctx, db);
		expect(ctx.reply).toHaveBeenCalledOnce();
		const msg = vi.mocked(ctx.reply).mock.calls[0][0];
		expect(msg).toContain("Authentication required");
	});

	test("replies with inline keyboard for semesters", async () => {
		const ctx = createMockContext({
			auth: {
				token: "fake-token",
				user: { id: "user1", password: "password", username: "test", name: "test", regno: "123" } as any,
				reqs: 0,
			},
		});
		const db = createMockDb();

		await attendance(ctx, db);
		expect(ctx.reply).toHaveBeenCalledOnce();
		const replyArgs = vi.mocked(ctx.reply).mock.calls[0];
		expect(replyArgs[0]).toBe("Select from your sem list");
		expect(replyArgs[1]).toBeDefined();
		expect((replyArgs[1] as any).reply_markup).toBeDefined();
	});
});
