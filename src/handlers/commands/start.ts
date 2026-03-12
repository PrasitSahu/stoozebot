import { BotContext, DB } from "../../config";
import { text } from "../register";

export async function start(ctx: BotContext, db: DB) {
	if (ctx.chat?.type === "private") {
		await ctx.reply(greet(ctx.chat.first_name), { parse_mode: "Markdown" });

		// new user
		if (!ctx.auth.telegramUser) {
			await ctx.reply(initInfoMessage(), { parse_mode: "Markdown" });
		}
	}
}

function greet(name: string) {
	// TODO: make a list of features
	return `
    Hello ${name} 👋,
	
    *Here's what I can help you with:*

    📅 Track attendance - /attendance
    `;
}

function initInfoMessage(): string {
	return text(`
🔐 *Student Login Required*

To access your academic data, please authenticate.

🔒 *Security Notice*

We never store your password in plain text or in reversible encoded form.  
Passwords are securely hashed before storage and cannot be viewed by anyone — including administrators.

Looks like you are a new user:
Submit credentials using:

\`#login REGNO_PASSWORD\`

Example:
\`#login 2341010000_mySecurePass123\`

Ensure:
- No spaces
- Correct registration number
- Correct password

Need help? Use /help
`);
}
