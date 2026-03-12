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

export const ReplyNoAuth = text(`⚠️ Authentication required.
You need to log in before using this command.
Use: \`#login REGNO_PASSWORD\``);

export const ReplyInvalidFormat = text("portal provided unexpected data. Please have patience fix is on the way 🙂");
export const ReplyInvalidCreds = text("❌ Invalid credentials. Try again...");
export const ReplySomethingWentWrong = text("something went wrong! Fix is on the way 🙂");
