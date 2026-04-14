import { createExecutionContext, env, waitOnExecutionContext } from "cloudflare:test";
import { describe, expect, test } from "vitest";
import worker, { setEnvChecked } from "../src/index";

const IncomingRequest = Request<unknown, IncomingRequestCfProperties>;

describe("fetch function", () => {
	test("rejects unverified requests", async () => {
		const req = new IncomingRequest("https://api.telegram.org");
		const ctx = createExecutionContext();

		setEnvChecked(true);

		const res = await worker.fetch(req, env, ctx);
		await waitOnExecutionContext(ctx);

		expect(res.status).toBe(400);
	});
});
