import { vi } from "vitest";
import { BotContext } from "../../src/config";

export function createMockContext(overrides: Partial<BotContext> = {}): BotContext {
	return {
		config: {
			botDeveloper: 123456789,
			isBotDeveloper: true,
		},
		auth: null,
		chat: {
			type: "private",
			id: 123456,
			first_name: "John",
		},
		reply: vi.fn().mockResolvedValue({ message_id: 123, chat: { id: 123456 } }),
		deleteMessage: vi.fn(),
		answerCallbackQuery: vi.fn(),
		replyWithChatAction: vi.fn(),
		editMessageText: vi.fn(),
		hasCallbackQuery: vi.fn(),
		api: {
			editMessageText: vi.fn(),
			answerCallbackQuery: vi.fn(),
		},
		...overrides,
	} as unknown as BotContext;
}
