import { describe, expect, test, vi, beforeEach } from "vitest";
import { getAttendance } from "../../../../src/handlers/private/commands/attendance/attendance";
import { createMockContext } from "../../../utils/mockContext";
import { createMockDB } from "../../../utils/mockDB";

vi.mock("../../../../src/services/soaPortals", () => {
	return {
		default: vi.fn().mockImplementation(() => ({
			getAttendance: vi.fn().mockResolvedValue({
				status: { responseStatus: "Success" },
				response: {
					studentattendancelist: [
						{
							slno: 1,
							subject: "Mathmatics",
							subjectcode: "MATH101",
							TotalClass: "9/10",
							Attendanceperc: "90%",
							sty_no: "SEM1",
						},
					],
				},
			}),
		})),
	};
});

describe("attendance command (getAttendance callback)", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	test("replies with attendance details and updates DB", async () => {
		const ctx = createMockContext({
			auth: {
				token: "fake-token",
				user: { id: "user1", password: "password", username: "test", name: "test", regno: "123" } as any,
				reqs: 0,
			},
			match: ["#attendance 123-SEM1", "123", "SEM1"],
		});
		const db = createMockDB();

		await getAttendance(ctx, db);

		expect(ctx.answerCallbackQuery).toHaveBeenCalledOnce();

		expect(db.insert).toHaveBeenCalled();
		expect(ctx.reply).toHaveBeenCalledOnce();

		const replyArgs = vi.mocked(ctx.reply).mock.calls[0];
		expect(replyArgs[0]).toContain("Mathmatics (MATH101)");
		expect(replyArgs[0]).toContain("90%");
	});
});
