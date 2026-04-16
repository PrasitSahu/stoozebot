import { vi } from "vitest";
import { DB } from "../../src/config";

export function createMockDB(): DB {
	return {
		query: {
			users: {
				findFirst: vi.fn(),
			},
			platformUsers: {
				findFirst: vi.fn(),
			},
		},
		insert: vi.fn(() => ({
			values: vi.fn(() => ({
				onConflictDoUpdate: vi.fn(),
				returning: vi.fn(),
			})),
		})),
		update: vi.fn(() => ({
			set: vi.fn(() => ({
				where: vi.fn(),
			})),
		})),
		delete: vi.fn(() => ({
			where: vi.fn(),
		})),
		select: vi.fn(() => ({
			from: vi.fn(() => ({
				where: vi.fn(),
				limit: vi.fn(),
			})),
		})),
		transaction: vi.fn(async (callback) => await callback(createMockDB())),
	} as unknown as DB;
}
