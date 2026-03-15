import { describe, expect, test } from "vitest";
import worker from "../src/index";
import { createExecutionContext, env, waitOnExecutionContext } from "cloudflare:test";

const IncomingRequest = Request<unknown, IncomingRequestCfProperties>;

describe("fetch function", () => {
	test("rejects unverified requests", async () => {
		const req = new IncomingRequest("https://api.telegram.org");
		const ctx = createExecutionContext();

		const res = await worker.fetch(req, env, ctx);
		await waitOnExecutionContext(ctx);

		expect(res.status).toBe(400);
	});
});
