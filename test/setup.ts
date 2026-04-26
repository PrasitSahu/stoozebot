import { vi } from "vitest";

// Mock environment variables
vi.stubEnv("APP_URL", "https://example.com");
vi.stubEnv("PAGES_URL", "https://pages.example.com");
vi.stubEnv("BOT_TOKEN", "123456789:ABCDEFGH-IJKLM-NOPQRST-UVWXYZ");
vi.stubEnv("BOT_SECRET", "mock_secret");
vi.stubEnv("BOT_LIMIT", "100");
vi.stubEnv("BOT_DEVELOPER", "123456789");
vi.stubEnv("BOT_NEWS_CHANNEL", "@mock_channel");
vi.stubEnv("KEY", "mock_key_32_bytes_long_12345678901");
vi.stubEnv("IV", "mock_iv_16_bytes_long_12345");
vi.stubEnv("PROXY", "https://proxy.example.com");
vi.stubEnv("PROXY_SIGNATURE", "mock_signature");
vi.stubEnv("CLIENT_ID", "mock_client_id");
vi.stubEnv("INSTITUTE_ID", "mock_institute_id");
vi.stubEnv("LIMIT_PER_DAY", "50");

// Mock grammy to avoid "Empty token!" error if process.env is still not enough
vi.mock("grammy", async () => {
	const actual = (await vi.importActual("grammy")) as any;
	return {
		...actual,
		Bot: class extends actual.Bot {
			constructor(token: string, options: any) {
				super(token || "mock_token", options);
			}
		},
	};
});
