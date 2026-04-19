import { describe, expect, it, vi, beforeEach } from "vitest";
import { login } from "@/handlers/private/auth/login";
import { createMockContext } from "../../../utils/mockContext";
import { createMockDB } from "../../../utils/mockDB";
import { Composer } from "grammy";
import { BotContext } from "@/config";
import soaPortals from "@/services/soaPortals";
import * as userUtils from "@/handlers/private/auth/user";

// Mock external services and utils
vi.mock("@/services/soaPortals");
vi.mock("@/utils", () => ({
	aesEnc: vi.fn(() => "mocked_encrypted_token"),
	text: (str: string) => str.trim(),
}));
vi.mock("@/handlers/private/auth/user", async () => {
	const actual = (await vi.importActual("@/handlers/private/auth/user")) as any;
	return {
		...actual,
		createUser: vi.fn(),
		updateUserCreds: vi.fn(),
		createPlatformUser: vi.fn(),
	};
});

describe("login handler", () => {
	let bot: Composer<BotContext>;
	let db: any;
	let handler: (ctx: any) => Promise<void>;

	beforeEach(() => {
		bot = new Composer<BotContext>();
		db = createMockDB();

		// Capture the handler registered by login(bot, db)
		const hearsSpy = vi.spyOn(bot, "hears");
		login(bot, db);
		handler = hearsSpy.mock.calls[0][1] as any;
	});

	it("should reply 'Already logged in' if user is already authenticated", async () => {
		const ctx = createMockContext({
			auth: { user: { id: "1" } } as any,
			message: { text: "#login REGNO_PASS" } as any,
		});

		await handler(ctx);

		expect(ctx.reply).toHaveBeenCalledWith("✅ Already logged in");
	});

	it("should handle new user login correctly", async () => {
		const ctx = createMockContext({
			auth: null,
			message: { text: "#login 21BCE0001_password" } as any,
			chat: { id: 123456, type: "private" } as any,
			deleteMessage: vi.fn(),
		});

		// Mock DB not finding the user
		db.query.users.findFirst.mockResolvedValue(null);

		// Mock SOA Portal service
		const mockGenToken = vi.fn().mockResolvedValue({
			status: { responseStatus: "Success" },
			response: { regdata: { name: "Test User", token: "api_token", userDOB: "2000-01-01" } },
		});
		const mockGetPersonalInfo = vi.fn().mockResolvedValue({
			status: { responseStatus: "Success" },
			response: {
				generalinformation: {
					registrationno: "21BCE0001",
					gender: "Male",
					programcode: "B.Tech",
					branch: "CSE",
					admissionyear: "2021",
					category: "General",
					studentpersonalemailid: "test@example.com",
					studentcellno: "1234567890",
				},
			},
		});

		vi.mocked(soaPortals).mockImplementation(
			() =>
				({
					genToken: mockGenToken,
					getPersonalInfo: mockGetPersonalInfo,
				}) as any,
		);

		await handler(ctx);

		expect(userUtils.createUser).toHaveBeenCalled();
		expect(ctx.reply).toHaveBeenCalledWith("✅ Done");
	});

	it("should handle existing user login (credential update)", async () => {
		const ctx = createMockContext({
			auth: null,
			message: { text: "#login 21BCE0001_password" } as any,
			chat: { id: 123456, type: "private" } as any,
			deleteMessage: vi.fn(),
		});

		// Mock DB finding the user
		db.query.users.findFirst.mockResolvedValue({ id: "user_1", regNo: "21BCE0001" });

		// Mock SOA Portal service success
		const mockGenToken = vi.fn().mockResolvedValue({
			status: { responseStatus: "Success" },
			response: { regdata: { token: "new_api_token" } },
		});

		vi.mocked(soaPortals).mockImplementation(
			() =>
				({
					genToken: mockGenToken,
				}) as any,
		);

		await handler(ctx);

		expect(userUtils.updateUserCreds).toHaveBeenCalled();
		expect(userUtils.createPlatformUser).toHaveBeenCalled();
		expect(ctx.reply).toHaveBeenCalledWith("✅ Done");
	});

	it("should handle invalid credentials from external service", async () => {
		const ctx = createMockContext({
			auth: null,
			message: { text: "#login 21BCE0001_wrong" } as any,
			chat: { id: 123456, type: "private" } as any,
			deleteMessage: vi.fn(),
		});

		db.query.users.findFirst.mockResolvedValue(null);

		const mockGenToken = vi.fn().mockResolvedValue({
			status: { responseStatus: "Error" },
		});

		vi.mocked(soaPortals).mockImplementation(
			() =>
				({
					genToken: mockGenToken,
				}) as any,
		);

		await handler(ctx);

		// Should call error handler or reply with error
		// Note: handleErrors is imported and called in the handler
		expect(ctx.reply).toHaveBeenCalledWith(expect.stringContaining("wrong password"), expect.anything());
	});
});
