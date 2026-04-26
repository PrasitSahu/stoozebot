import { describe, expect, it, vi, beforeEach } from "vitest";
import { manageToken, upsertNewToken } from "@/middlewares/authToken";
import { createMockContext } from "../utils/mockContext";
import { createMockDB } from "../utils/mockDB";
import jwt from "jsonwebtoken";
import SoaPService from "@/services/soaPortals";

vi.mock("@/services/soaPortals", () => {
	return {
		default: vi.fn(),
	};
});

vi.mock("jsonwebtoken", () => ({
	default: {
		decode: vi.fn(),
	},
	decode: vi.fn(),
}));

describe("authToken middleware", () => {
	let db: any;

	beforeEach(() => {
		db = createMockDB();
		vi.resetAllMocks();
	});

	describe("manageToken", () => {
		it("should skip if no user in auth", async () => {
			const ctx = createMockContext({ auth: null });
			const next = vi.fn();
			const middleware = manageToken(db);

			await middleware(ctx as any, next);

			expect(next).toHaveBeenCalled();
		});

		it("should upsert token if no token exists", async () => {
			const ctx = createMockContext({
				auth: { user: { id: "user_1", password: "pwd" }, token: null, reqs: 0 } as any,
			});
			const next = vi.fn();

			// Mock SOA Portal service for upsertNewToken
			const mockGenToken = vi.fn().mockResolvedValue({
				status: { responseStatus: "Success" },
				response: { regdata: { token: "new_api_token" } },
			});
			vi.mocked(SoaPService).mockImplementation(
				() =>
					({
						genToken: mockGenToken,
					}) as any,
			);

			const middleware = manageToken(db);
			await middleware(ctx as any, next);

			expect(ctx.auth?.token).toBe("new_api_token");
			expect(next).toHaveBeenCalled();
		});

		it("should refresh token if expired", async () => {
			const expiredToken = "expired_token";
			const ctx = createMockContext({
				auth: {
					user: { id: "user_1", password: "pwd" },
					token: expiredToken,
					reqs: 0,
				} as any,
			});
			const next = vi.fn();

			// Mock JWT decode to return expired time
			vi.mocked(jwt.decode).mockReturnValue({ exp: Date.now() / 1000 - 60 } as any);

			// Mock SOA Portal service for refresh
			const mockGenToken = vi.fn().mockResolvedValue({
				status: { responseStatus: "Success" },
				response: { regdata: { token: "refreshed_token" } },
			});
			vi.mocked(SoaPService).mockImplementation(
				() =>
					({
						genToken: mockGenToken,
					}) as any,
			);

			const middleware = manageToken(db);
			await middleware(ctx as any, next);

			expect(ctx.auth?.token).toBe("refreshed_token");
			expect(next).toHaveBeenCalled();
		});
	});

	describe("upsertNewToken", () => {
		it("should throw error if genToken fails", async () => {
			const mockGenToken = vi.fn().mockResolvedValue({
				status: { responseStatus: "Error" },
			});
			vi.mocked(SoaPService).mockImplementation(
				() =>
					({
						genToken: mockGenToken,
					}) as any,
			);

			await expect(upsertNewToken("pwd", db, "user_1")).rejects.toThrow();
		});
	});
});
