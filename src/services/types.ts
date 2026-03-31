import z from "zod";
import { Err } from "../constants";

const ResponseStatus = z.union([z.literal("Success"), z.literal("Failure")], {
	error: "resposeStatus must be either 'Success' or 'Failure'",
});

export const Status = z.object(
	{
		responseStatus: ResponseStatus,
		errors: z.array(z.string()).nullable(),
		identifier: z.string().nullable(),
	},
	{
		error: (iss) => JSON.stringify(iss.input),
	},
);

export const Response = <T extends z.ZodTypeAny>(schema: T) =>
	z.object({
		status: Status,
		response: schema,
	});

export const Institute = z.object({
	label: z.string(),
	value: z.string(),
});

export const GenTokenResponse = z.object({
	regdata: z.object({
		clientid: z.string(),
		userDOB: z.string(), // yyyy-mm-dd
		name: z.string(),
		lastvisitdate: z.string().nullable(),
		marqueeList: z.string(),
		membertype: z.string(),
		enrollmentno: z.string(),
		userid: z.string(),
		expiredpassword: z.union([z.literal("Y"), z.literal("N")]),
		institutelist: z.array(Institute),
		memberid: z.string(),
		token: z.string(), // JWT
	}),
	OTP: z.union([z.literal("Y"), z.literal("N")]),
});

export const PersonalInfoResponse = z.object({
	qualification: z.array(z.object()),
	"photo&signature": z.object({}),
	generalinformation: z.object({
		registrationno: z.string(),
		gender: z.string(),
		programcode: z.string(),
		branch: z.string(),
		admissionyear: z.string(),
		category: z.string(),
		studentcellno: z.string(),
		studentpersonalemailid: z.string(),
	}),
});

export const Sem = z.object({
	registrationcode: z.string(),
	registrationid: z.string(),
});

export const SemListResponse = z.object({
	semlist: z.array(Sem),
});

export const Attendance = z.object({
	Attendanceperc: z.string(),
	TotalClass: z.string(),
	slno: z.number(),
	sty_no: z.string(),
	subject: z.string(),
	subjectcode: z.string(),
});

export const AttendanceResponse = z.object({
	studentattendancelist: z.array(Attendance),
});

export const Creds = z.object({
	otppwd: z.string(),
	username: z.string(),
	passwordotpvalue: z.string(),
	Modulename: z.string(),
});
const responseProp = "response";
const statusProp = "status";

export function resolveTypeIssues(issues: z.core.$ZodIssue[]) {
	issues.forEach((iss) => {
		// invalid status prop
		if (iss.path.includes(statusProp)) {
			const inp = parseInt(iss.message);
			if (!isNaN(inp) && typeof inp === "number") {
				switch (inp) {
					case 401:
						throw new Error(Err.ErrAuth);
				}
			}
		}

		// invalid response prop
		if (iss.path.includes(responseProp)) throw new Error(Err.ErrFailRes);
	});

	throw new Error(Err.ErrFormat);
}
