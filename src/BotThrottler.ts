import { DurableObject } from "cloudflare:workers";
import { checkEnv } from "@/index";

export class BotThrottler extends DurableObject {
	private globalRequests: number[] = [];
	private chatRequests: Map<string, number[]> = new Map();

	constructor(ctx: DurableObjectState, env: Env) {
		super(ctx, env);
		checkEnv();
		this.ctx.blockConcurrencyWhile(async () => {
			this.globalRequests = (await ctx.storage.get<number[]>("globalRequests")) || [];
			this.chatRequests = (await ctx.storage.get<Map<string, number[]>>("chatRequests")) || new Map();
		});
	}

	async getDelay(chatId: string): Promise<{ delay: number }> {
		const now = Date.now();
		const oneSecondAgo = now - 1000;

		// Clean up old requests
		this.globalRequests = this.globalRequests.filter((time) => time > oneSecondAgo);
		const chatReqs = this.chatRequests.get(chatId) || [];
		const cleanedChatReqs = chatReqs.filter((time) => time > oneSecondAgo);

		if (cleanedChatReqs.length === 0) {
			this.chatRequests.delete(chatId);
		} else {
			this.chatRequests.set(chatId, cleanedChatReqs);
		}

		let delay = 0;

		// Check global limit
		if (this.globalRequests.length >= Number(process.env.BOT_LIMIT)) {
			const oldestGlobal = this.globalRequests[0];
			delay = Math.max(delay, oldestGlobal + 1000 - now);
		}

		// Check chat limit (1 per second)
		const currentChatReqs = this.chatRequests.get(chatId) || [];
		if (currentChatReqs.length > 1) {
			const oldestChat = currentChatReqs[0];
			delay = Math.max(delay, oldestChat + 1000 - now);
		}

		// Calculate execution time after delay
		const executionTime = now + delay;

		// Record the future execution time
		this.globalRequests.push(executionTime);
		const updatedChatReqs = this.chatRequests.get(chatId) || [];
		updatedChatReqs.push(executionTime);
		this.chatRequests.set(chatId, updatedChatReqs);

		await this.ctx.storage.put("globalRequests", this.globalRequests);
		await this.ctx.storage.put("chatRequests", this.chatRequests);

		return { delay };
	}
}
