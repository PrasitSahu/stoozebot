import { BotContext, DB } from "@/config";
import { Err, ReplyNoAuth, ReplySiteDown } from "@/constants";
import { timetables as timetablesTable } from "@/db/schema/timetables";
import { handleErrors } from "@/handlers/errorHandler";
import SoaPService, { DayTimetable, Response, Timetable, TimetableResponse } from "@/services/soaPortals";
import { and, eq } from "drizzle-orm";
import { InlineKeyboard } from "grammy";

const dayMap: Record<string, string> = {
	mon: "Monday",
	tue: "Tuesday",
	wed: "Wednesday",
	thu: "Thursday",
	fri: "Friday",
	sat: "Saturday",
	sun: "Sunday",
};

function formatDayTimetable(day: string, slots: DayTimetable[]) {
	if (slots.length === 0) return "";

	let dayText = `*${dayMap[day] || day.toUpperCase()}*\n`;

	slots.forEach((slot) => {
		const time = slot.find((s) => s.Time)?.Time;
		const subject = slot.find((s) => s.Subject)?.Subject;
		const faculty = slot.find((s) => s.Faculty)?.Faculty;
		const room = slot.find((s) => s.Room)?.Room;

		if (time || subject) {
			dayText += `🕒 ${time || "N/A"}\n`;
			dayText += `📚 ${subject || "N/A"}\n`;
			if (faculty) dayText += `👨‍🏫 ${faculty}\n`;
			if (room) dayText += `📍 ${room}\n`;
			dayText += `\n`;
		}
	});

	return dayText;
}

export async function getTimetable(ctx: BotContext, db: DB) {
	try {
		await ctx.answerCallbackQuery();
		if (!ctx.auth || !ctx.auth.user || !ctx.match) {
			await ctx.reply(ReplyNoAuth, {
				parse_mode: "Markdown",
			});
			return;
		}

		const user = ctx.auth.user;
		const regId = ctx.match[1];
		const regCode = ctx.match[2];
		const dayParam = ctx.match[3];
		const refresh = ctx.match[4];

		const dayList = ["mon", "tue", "wed", "thu", "fri", "sat"];
		const today = new Date().toLocaleDateString("en-US", { weekday: "short" }).toLowerCase();
		const selectedDay = dayParam || (dayList.includes(today) ? today : "mon");

		if (!ctx.auth?.token) {
			console.error("token not found in auth");
			throw new Error(Err.ErrAuth);
		}

		await ctx.replyWithChatAction("typing");

		const soaPortalService = new SoaPService(user.password || "");
		let timetableRes: Response<TimetableResponse>;
		let timetableList: Timetable[] = [];
		let fromSource: boolean = true;

		try {
			timetableRes = await soaPortalService.getTimetable(ctx.auth.token, regId);

			if (timetableRes.status.responseStatus !== "Success") {
				throw new Error(Err.ErrFailRes);
			}

			timetableList = timetableRes.response.timeTableinfo.TimetableList;
			if (!timetableList) {
				throw new Error(Err.ErrFormat);
			}

			// Save to DB
			await db
				.insert(timetablesTable)
				.values({
					userId: user.id,
					regId: regId,
					regCode: regCode,
					data: JSON.stringify(timetableRes.response),
				})
				.onConflictDoUpdate({
					target: [timetablesTable.userId, timetablesTable.regId],
					set: {
						data: JSON.stringify(timetableRes.response),
						regCode: regCode,
					},
				});
		} catch (error) {
			if (error instanceof Error && error.message === Err.ErrReqFail) {
				fromSource = false;
				const t = await db
					.select()
					.from(timetablesTable)
					.where(and(eq(timetablesTable.userId, user.id), eq(timetablesTable.regId, regId)))
					.limit(1);
				if (t.length > 0) {
					const cachedData = JSON.parse(t[0].data) as TimetableResponse;
					timetableList = cachedData.timeTableinfo.TimetableList;
				}
			} else {
				throw error;
			}
		}

		const timetableByDay: Record<string, DayTimetable[]> = {
			mon: [],
			tue: [],
			wed: [],
			thu: [],
			fri: [],
			sat: [],
			sun: [],
		};

		timetableList.forEach((item: any) => {
			dayList.concat("sun").forEach((day) => {
				if (item[day] && Array.isArray(item[day]) && item[day].length > 0) {
					timetableByDay[day].push(item[day]);
				}
			});
		});

		let reply = `*Timetable for ${regCode}*\n\n`;
		const dayText = formatDayTimetable(selectedDay, timetableByDay[selectedDay]);

		if (dayText) {
			reply += dayText;
		} else {
			reply += `No classes found for ${dayMap[selectedDay] || selectedDay.toUpperCase()}. 😎`;
		}

		if (!fromSource) {
			reply = ReplySiteDown + "\n\n" + reply;
		}

		const inlineKeyboard = new InlineKeyboard();

		// Days row
		const row1 = dayList.slice(0, 3).map((day) => {
			const label = day === selectedDay ? `✅ ${day.toUpperCase()}` : day.toUpperCase();
			return InlineKeyboard.text(label, `#timetable ${regId}-${regCode}-${day}`);
		});
		const row2 = dayList.slice(3).map((day) => {
			const label = day === selectedDay ? `✅ ${day.toUpperCase()}` : day.toUpperCase();
			return InlineKeyboard.text(label, `#timetable ${regId}-${regCode}-${day}`);
		});

		inlineKeyboard
			.add(...row1)
			.row()
			.add(...row2)
			.row();
		inlineKeyboard.text("Cancel", "#cancel");

		if (refresh || dayParam) {
			if (ctx.msg?.text === reply) return;
			try {
				await ctx.editMessageText(reply, {
					parse_mode: "Markdown",
					reply_markup: inlineKeyboard,
				});
			} catch (error: any) {
				if (error.description?.includes("message is not modified")) return;
				throw error;
			}
		} else {
			await ctx.editMessageText(reply, {
				parse_mode: "Markdown",
				reply_markup: inlineKeyboard,
			});
		}
	} catch (error) {
		await handleErrors(ctx, error as Error);
	}
}
