import { describe, expect, it, vi } from "vitest";
import { privacyTOS } from "../../src/middlewares/privayToS";
import { createMockContext } from "../utils/mockContext";
import { AcceptPrivacyToS, CancelPrivacyToS } from "../../src/constants";

describe("privacyTOS middleware", () => {
	it("should reply with Privacy Policy/ToS when user has not accepted it", async () => {
		const ctx = createMockContext({
			auth: {
				user: {
					id: "user_1",
					name: "John Doe",
					regNo: "21BCE0001",
					password: "hashed_password",
					gender: "Male",
					dob: "2000-01-01",
					program: "B.Tech",
					branch: "CSE",
					admissionYear: "2021",
					category: "General",
					phone: "1234567890",
					email: "john@example.com",
					referredBy: null,
					privacyToS: false,
					createdAt: "2024-03-24T00:00:00Z",
					updatedAt: "2024-03-24T00:00:00Z",
					deletedAt: null,
				},
				reqs: 0,
				token: "mock_token",
			},
		});

		const next = vi.fn();

		await privacyTOS(ctx as any, next);

		expect(ctx.reply).toHaveBeenCalledWith(
			expect.stringContaining("you need to accept the **Privacy Policy** and **Terms of Service** to use this bot"),
			expect.objectContaining({
				parse_mode: "Markdown",
				reply_markup: expect.objectContaining({
					inline_keyboard: expect.arrayContaining([
						expect.arrayContaining([
							expect.objectContaining({ text: "✅ Accept", callback_data: AcceptPrivacyToS }),
							expect.objectContaining({ text: "Cancel", callback_data: CancelPrivacyToS }),
						]),
						expect.arrayContaining([
							expect.objectContaining({ text: "Privacy Policy", web_app: { url: expect.stringContaining("/privacyPolicy") } }),
						]),
						expect.arrayContaining([
							expect.objectContaining({ text: "Terms of Service", web_app: { url: expect.stringContaining("/termsOfService") } }),
						]),
					]),
				}),
			})
		);
		expect(next).not.toHaveBeenCalled();
	});

	it("should call next() when user has accepted Privacy/ToS", async () => {
		const ctx = createMockContext({
			auth: {
				user: {
					id: "user_1",
					name: "John Doe",
					regNo: "21BCE0001",
					password: "hashed_password",
					gender: "Male",
					dob: "2000-01-01",
					program: "B.Tech",
					branch: "CSE",
					admissionYear: "2021",
					category: "General",
					phone: "1234567890",
					email: "john@example.com",
					referredBy: null,
					privacyToS: true,
					createdAt: "2024-03-24T00:00:00Z",
					updatedAt: "2024-03-24T00:00:00Z",
					deletedAt: null,
				},
				reqs: 0,
				token: "mock_token",
			},
		});

		const next = vi.fn();

		await privacyTOS(ctx as any, next);

		expect(ctx.reply).not.toHaveBeenCalled();
		expect(next).toHaveBeenCalled();
	});
});
