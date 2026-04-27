import { Composer } from "grammy";
import { BotContext, DB } from "@/config";
import {
	AcceptPrivacyToS,
	attendanceRegex,
	CancelPrivacyToS,
	ResultRegex,
	TimetableRegex,
	AdmitCardRegRegex,
	AdmitCardExamTypeRegex,
	AdmitCardDnRegex,
	AcceptPrivacyToSRegex,
	CancelPrivacyToSRegex,
} from "../../constants";
import { auth, filterNAuth } from "../../middlewares/auth";
import { privacyTOS } from "../../middlewares/privayToS";
import { limits } from "../../middlewares/limits";
import { manageToken } from "../../middlewares/authToken";

import { login } from "./auth/login";
import { updateCreds } from "./auth/updateCreds";
import { getAttendance } from "./commands/attendance/attendance";
import { attendance } from "./commands/attendance/listSem";
import { help } from "./commands/help";
import { logout } from "./commands/logout";
import { downloadResult } from "./commands/result/downloadResult";
import { result } from "./commands/result/result";
import { getTimetable } from "./commands/timetable/timetable";
import { timetable } from "./commands/timetable/listSem";
import { start } from "./commands/start";
import { securityMode, enableCMode, disableCMode } from "./commands/security";
import { admitcard, listExamTypes, listExamCodes } from "./commands/admitcard/admitcard";
import { downloadAdmitCard } from "./commands/admitcard/downloadAdmitCard";
import { acceptPrivacyToS, cancelPrivacyToS } from "./PToS";
import { Commands } from "../register";

export const privateComposer = (db: DB) => {
	const composer = new Composer<BotContext>();

	// middlewares (moved from global to private specific)
	composer.use(auth(db));
	composer.use(privacyTOS);
	composer.use(limits);
	composer.use(manageToken(db));

	// Authentication flows
	login(composer, db);
	updateCreds(composer, db);

	composer.callbackQuery("#cancel", async (ctx) => {
		try {
			await ctx.answerCallbackQuery();
			await ctx.deleteMessage();
		} catch (error) {}
	});

	// commands
	composer.command(Commands.Start, (ctx) => start(ctx, db));
	composer.command(Commands.Help, (ctx) => help(ctx));
	composer.command(Commands.SecurityMode, (ctx) => securityMode(ctx));
	composer.command(Commands.EnableCMode, (ctx) => enableCMode(ctx, db));
	composer.command(Commands.DisableCMode, (ctx) => disableCMode(ctx, db));

	// Grouping authenticated commands
	const authGroup = new Composer<BotContext>();
	authGroup.use(filterNAuth);
	composer.use(authGroup);

	authGroup.command(Commands.Logout, (ctx) => logout(ctx, db));

	// attendance commands
	authGroup.command(Commands.Attendance, (ctx) => attendance(ctx, db));
	authGroup.callbackQuery(attendanceRegex, (ctx) => getAttendance(ctx, db));

	// result commands
	authGroup.command(Commands.Result, (ctx) => result(ctx, db));
	authGroup.callbackQuery(ResultRegex, (ctx) => downloadResult(ctx, db));

	// timetable commands
	authGroup.command(Commands.Timetable, (ctx) => timetable(ctx, db));
	authGroup.callbackQuery(TimetableRegex, (ctx) => getTimetable(ctx, db));

	// admitcard commands
	authGroup.command(Commands.AdmitCard, (ctx) => admitcard(ctx));
	authGroup.callbackQuery(AdmitCardRegRegex, (ctx) => listExamTypes(ctx));
	authGroup.callbackQuery(AdmitCardExamTypeRegex, (ctx) => listExamCodes(ctx));
	authGroup.callbackQuery(AdmitCardDnRegex, (ctx) => downloadAdmitCard(ctx));

	composer.callbackQuery(AcceptPrivacyToSRegex, (ctx) => acceptPrivacyToS(ctx, db));
	composer.callbackQuery(CancelPrivacyToSRegex, (ctx) => cancelPrivacyToS(ctx, db));

	return composer;
};
