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
	OTP: z.union([z.literal("Y"), z.literal("N")]).optional(),
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

export const StudentInfo = z.object({
	branchid: z.string(),
	branchcode: z.string(),
	academicyear: z.string(),
	quotaid: z.string(),
	lateralentry: z.union([z.literal("Y"), z.literal("N")]),
	quotacode: z.string(),
	stynumber: z.number(),
	programcode: z.string(),
	programdesc: z.string(),
	name: z.string(),
	instituteid: z.string(),
	enrollmentno: z.string(),
	branchdesc: z.string(),
	programid: z.string(),
});

export const StudentInfoResponse = z.object({
	studentInfo: z.array(StudentInfo),
});

export const SemesterData = z.object({
	totalpointsecuredsgpa: z.number(),
	totalcoursecredit: z.number(),
	totalearnedcredits: z.number(),
	totalpointsecuredcgpa: z.number(),
	totalearnedcredit: z.number(),
	semesterDesc: z.string(),
	sgpa: z.number(),
	stynumber: z.number(),
	totalregisteredcredit: z.number(),
	prograsivegradepoints: z.number(),
	registeredcredit: z.number(),
	totalgradepoints: z.number(),
	cgpa: z.number(),
	prograsivetotalearnedcredit: z.number(),
	earnedgradepoints: z.number(),
	prograde: z.number(),
});

export const SemesterDataResponse = z.object({
	semesterList: z.array(SemesterData),
});

export const SubjectResult = z.object({
	gradepoint: z.string(),
	equivalent_grade_point: z.number(),
	subjectcode: z.string(),
	"Progressive Grade Points Earned (Upto the current semester) ": z.string(),
	minorsubject: z.string(),
	passfail: z.string(),
	creditEarnedInSemeseter: z.number(),
	subjectdesc: z.string(),
	course_credits: z.number(),
	earned_credit: z.number(),
	gradePointEarnedInSemeseter: z.string(),
	cgpapoint: z.number(),
	grade: z.string(),
	sgpapoint: z.number(),
	status: z.string(),
});

export const DetailedSemesterDataResponse = z.object({
	semesterList: z.array(SubjectResult),
});

export const SemesterReportBody = z.object({
	studentname: z.string(),
	instituteid: z.string(),
	studentinfolist: z.array(SubjectResult),
	cgpa: z.number(),
	sgpa: z.number(),
	enrollmentno: z.string(),
	programmcode: z.string(),
	branchcode: z.string(),
	stynumber: z.number(),
	branchdesc: z.string(),
	totalsgpa: z.number(),
	totalearnedcredit: z.number(),
	totalcoursecredit: z.number(),
});

export const AdmitCardReg = z.object({
	REGISTRATIONID: z.string(),
	REGISTRATIONCODE: z.string(),
});

export const AdmitCardExamType = z.object({
	EXAMTYPEID: z.string(),
	EXAMTYPEDESC: z.string(),
});

export const AdmitCardMetaDataResponse = z.object({
	studentInfo: z.array(StudentInfo),
	regList: z.array(AdmitCardReg),
	examTypeList: z.array(AdmitCardExamType),
});

export const AdmitCardPayload = z.object({
	instituteid: z.string(),
	registrationid: z.string(),
	exameventid: z.string(),
	enrollmentno: z.string(),
	studentname: z.string(),
	programmdesc: z.string(),
	branchdesc: z.string(),
});

export const AdmitCardExamCode = z.object({
	EXAMEVENTCODE: z.string(),
	EXAMEVENTID: z.string(),
});

export const AdmitCardExamCodeResponse = z.object({
	examList: z.object({
		examCode: z.array(AdmitCardExamCode),
	}),
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
