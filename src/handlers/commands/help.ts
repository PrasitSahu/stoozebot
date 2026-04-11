import { BotContext } from "../../config";
import { text } from "../../utils";

const replyHelp = text(
	`
Welcome! Here are the commands you can use:

📌 Available Commands

/start — Start the bot
/attendance — View your semester attendance
/admitcard — Download your admit card
/result — Check your semester results
/logout — Remove saved credentials
/help — Show this help message

\`#login REGNO_PASSWORD\` — Login to the portal
\`#updatecreds REGNO_PASSWORD\` — Update your credentials
━━━━━━━━━━━━━━

💡 How to Use

1️⃣ Login using the #login format
2️⃣ Use /attendance to check attendance
3️⃣ Select the semester from the menu

    `,
);

export async function help(ctx: BotContext) {
	try {
		await ctx.reply(replyHelp, {
			parse_mode: "Markdown",
		});
	} catch (error) {
		console.error(error);
	}
}
