import { describe, expect, it, vi, beforeEach } from "vitest";
import { updateCreds } from "../../../../src/handlers/private/auth/updateCreds";
import { createMockContext } from "../../../utils/mockContext";
import { createMockDB } from "../../../utils/mockDB";
import { Composer } from "grammy";
import { BotContext } from "../../../../src/config";
import soaPortals from "@/services/soaPortals";
import * as userUtils from "../../../../src/handlers/private/auth/user";

vi.mock("@/services/soaPortals", () => {
	return {
		default: vi.fn(),
	};
});

vi.mock("../../../../src/utils", () => ({
	aesEnc: vi.fn(() => "mocked_encrypted_token"),
	text: (str: string) => str.trim(),
}));

vi.mock("../../../../src/handlers/private/auth/user", async () => {
	const actual = (await vi.importActual("../../../../src/handlers/private/auth/user")) as any;
	return {
		...actual,
		updateUserCreds: vi.fn(),
	};
});

describe("updateCreds handler", () => {
	let bot: Composer<BotContext>;
	let db: any;
	let handler: (ctx: any) => Promise<void>;

	beforeEach(() => {
		bot = new Composer<BotContext>();
		db = createMockDB();

		const hearsSpy = vi.spyOn(bot, "hears");
		updateCreds(bot, db);
		handler = hearsSpy.mock.calls[0][1] as any;
	});

	it("should reply with error if user is not logged in", async () => {
		const ctx = createMockContext({
			auth: null,
			message: { text: "#updatecreds 21BCE0001_pwd" } as any,
		});
		await handler(ctx);
		expect(ctx.reply).toHaveBeenCalledWith(expect.stringContaining("Authentication required"));
	});

	it("should update credentials for logged in user", async () => {
		const ctx = createMockContext({
			auth: { user: { id: "user_1", regNo: "21BCE0001" } } as any,
			message: { text: "#updatecreds 21BCE0001_newpassword" } as any,
			chat: { id: 123456, type: "private" } as any,
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

		expect(userUtils.updateUserCreds).toHaveBeenCalledWith(db, "user_1", "mocked_encrypted_token", "new_api_token");
		expect(ctx.reply).toHaveBeenCalledWith("✅ Credentials updated successfully.");
	});
});
