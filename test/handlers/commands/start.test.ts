import { describe, expect, test, vi, beforeEach } from "vitest";
import { bot } from "../register.test";

describe("start command", () => {
	let sendMessageSpy = vi.fn();

	beforeEach(() => {
		sendMessageSpy.mockClear();
		bot.api.config.use(async (prev, method, payload, signal) => {
			if (method === "sendMessage") {
				sendMessageSpy(payload);
				return { ok: true, result: { message_id: 1, date: 1, chat: { id: 1, type: "private" } } } as any;
			}
			return { ok: true, result: true } as any;
		});
	});

	test("greet", async () => {
		await bot.handleUpdate({
			update_id: 123,
			message: {
				message_id: 30,
				from: {
					id: 123,
					is_bot: false,
					first_name: "Prasit",
					last_name: "Sahu",
					username: "test",
					language_code: "en",
				},
				chat: {
					id: 123,
					first_name: "Prasit",
					last_name: "Sahu",
					username: "test",
					type: "private",
				},
				date: 1772431523,
				text: "/start",
				entities: [
					{
						offset: 0,
						length: 6,
						type: "bot_command",
					},
				],
			},
		});

		expect(sendMessageSpy).toHaveBeenCalled();
		const payload = sendMessageSpy.mock.calls[0][0];
		expect(payload.chat_id).toBe(123);
		expect(payload.text).toContain("Hello Prasit 👋");
	});
});
