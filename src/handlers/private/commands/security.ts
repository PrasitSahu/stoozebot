import { BotContext, DB } from "@/config";
import { Platform, SecurityMode } from "@/constants";
import { platformUsers, users } from "@/db";
import { and, eq } from "drizzle-orm";

export async function securityMode(ctx: BotContext) {
	const mode = ctx.auth?.securityMode || SecurityMode.Privacy;

	let message = `🛡️ <b>Current Security Mode:</b> <code>${mode}</code>\n\n`;

	if (mode === SecurityMode.Privacy) {
		message +=
			"✅ <b>Privacy Mode Active</b>\nYour password is never stored. You will need to log in manually whenever your session expires.";
	} else {
		message +=
			"🚀 <b>Convenience Mode Active</b>\nYour password is stored securely (encrypted) to allow automatic re-authentication when your session expires.";
	}

	message +=
		"\n\n<b>Available Commands:</b>\n/enable_cmode - Switch to Convenience Mode\n/disable_cmode - Switch to Privacy Mode and delete saved password";

	await ctx.reply(message, { parse_mode: "HTML" });
}

export async function enableCMode(ctx: BotContext, db: DB) {
	if (!ctx.chat) return;

	if (ctx.auth?.securityMode === SecurityMode.Convenience) {
		await ctx.reply("Already in Convenience Mode");
		return;
	}

	await db
		.update(platformUsers)
		.set({ securityMode: SecurityMode.Convenience })
		.where(and(eq(platformUsers.platformId, ctx.chat.id.toString()), eq(platformUsers.platform, Platform.Telegram)));

	await ctx.reply(
		"✅ *Convenience Mode Enabled!*\n\nYour password will be stored securely from your *next* login. If you are currently logged in with Privacy Mode, your password is still not stored. Use `#login REGNO_PASSWORD` again to save it.",
		{ parse_mode: "Markdown" },
	);
}

export async function disableCMode(ctx: BotContext, db: DB) {
	if (!ctx.chat) return;

	if (ctx.auth?.securityMode === SecurityMode.Privacy) {
		await ctx.reply("Already in Privacy Mode");
		return;
	}

	await db
		.update(platformUsers)
		.set({ securityMode: SecurityMode.Privacy })
		.where(and(eq(platformUsers.platformId, ctx.chat.id.toString()), eq(platformUsers.platform, Platform.Telegram)));

	if (ctx.auth?.user?.id) {
		await db.update(users).set({ password: null }).where(eq(users.id, ctx.auth.user.id));
	}

	await ctx.reply(
		"✅ *Privacy Mode Enabled!*\n\nYour saved credentials have been deleted. You will need to log in manually when your current session expires.",
		{ parse_mode: "Markdown" },
	);
}
