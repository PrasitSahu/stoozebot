import { text } from "./utils";

export const enum Platform {
	Telegram = "telegram",
}

export const enum Err {
	ErrFormat = "INVALID_FORMAT",
	ErrInvalidCred = "INVALID_CRED",
	ErrFailRes = "FAIL_RESPONSE",
	ErrNoURL = "NO_URL",
	ErrInvalidURL = "INVALID_URL",
	ErrReqFail = "REQ_FAILED",
	ErrAuth = "UNAUTHORIZED",
}

// replies
export const ReplyDone = text("✅ Done");
export const ReplyInvalidFormat = text("portal provided unexpected data. Please have patience fix is on the way 🙂");
export const ReplyInvalidCreds = text("🙃 Looks like youv'e entered a wrong password");
export const ReplySomethingWentWrong = text("something went wrong! Fix is on the way 🙂");
export const ReplyLimitReached = text(
	`
	⚠️ Daily limit reached.
	You have exhausted your daily request limit. No further replies will be sent until tomorrow.
	`,
);
export const ReplyNoAuth = text(
	`
	⚠️ Authentication required.\nYou need to log in before using this command.\nUse: \`#login REGNO_PASSWORD\`
`,
);
export const ReplySiteDown = text("⚠️ The site is Down");
export const ReplyFailRes = text(`⚠️ Received a failed response from the site`);

// regex
export const attendanceRegex = /#attendance\s+([A-Z0-9]+)-(.+?)(?:-(r))?$/;
export const UpdateCredsRegex = /#updatecreds\s+([A-Z0-9]+)_([^\s]+)/;
export const LoginRegex = /#login\s+([A-Z0-9]+)_([^\s]+)/;
export const ResultRegex = /^#result\s+(\d+)$/;

export const AcceptPrivacyToS = "#accept privacy_tos";
export const CancelPrivacyToS = "#cancel privacy_tos";

export const GlobalThrottlerKey = "global_bot_throttler";
