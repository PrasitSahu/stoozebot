import { BotContext } from "../../config";
import { text } from "../../utils";

const replyHelp = text(
	`
Welcome! Here are the commands you can use:

📌 Available Commands

/start — Start the bot
#login REGNO_PASSWORD — Login to the portal
/attendence — View your semester attendance
/logout — Remove saved credentials
/help — Show this help message

━━━━━━━━━━━━━━

ℹ️ How to Use

1️⃣ Login using the #login format
2️⃣ Use /attendence to check attendance
3️⃣ Select the semester from the menu

━━━━━━━━━━━━━━

⚠️ Notes

• Your credentials are stored securely
• If attendance fails to load, try /login again

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
