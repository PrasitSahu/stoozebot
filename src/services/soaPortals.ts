import { Err } from "../constants";
import { aesDec, aesEnc } from "../utils";
import { Method } from "./service";

interface Status {
	responseStatus: "Success" | "Failure";
	errors: string[] | null;
	identifier: string | null;
}

export interface Response<T> {
	status: Status;
	response: T;
}

export interface GenTokenResponse {
	regdata: {
		clientid: string;
		userDOB: string; // yyyy-mm-dd
		name: string;
		lastvisitdate: string | null;
		marqueeList: string;
		membertype: string;
		enrollmentno: string;
		userid: string;
		expiredpassword: "Y" | "N";
		institutelist: Institute[];
		memberid: string;
		token: string; // JWT
	};
	OTP: "Y" | "N";
}

export interface PersonalInfoResponse {
	qualification: {};
	"photo&signature": {};
	generalinformation: {
		registrationno: string;
		gender: string;
		programcode: string;
		branch: string;
		admissionyear: string;
		category: string;
		studentcellno: string;
		studentpersonalemailid: string;
	};
}

export interface Sem {
	registrationcode: string;
	registrationid: string;
}

export interface SemListResponse {
	semlist: Sem[];
}

export interface Attendance {
	Attendanceperc: string;
	TotalClass: string;
	slno: number;
	sty_no: string;
	subject: string;
	subjectcode: string;
}

export interface AttendanceResponse {
	studentattendancelist: Attendance[];
}

export interface Institute {
	label: string;
	value: string;
}

interface StudentInfoResponse {
	studentInfo: {
		branchid: string;
		branchcode: string;
		academicyear: string;
		quotaid: string;
		lateralentry: "Y" | "N";
		quotacode: string;
		stynumber: number;
		programcode: string;
		programdesc: string;
		name: string;
		instituteid: string;
		enrollmentno: string;
		branchdesc: string;
		programid: string;
	}[];
}

export interface SemesterData {
	totalpointsecuredsgpa: number;
	totalcoursecredit: number;
	totalearnedcredits: number;
	totalpointsecuredcgpa: number;
	totalearnedcredit: number;
	semesterDesc: string;
	sgpa: number;
	stynumber: number;
	totalregisteredcredit: number;
	prograsivegradepoints: number;
	registeredcredit: number;
	totalgradepoints: number;
	cgpa: number;
	prograsivetotalearnedcredit: number;
	earnedgradepoints: number;
	prograde: number;
}

export interface SemesterDataResponse {
	semesterList: SemesterData[];
}

export interface SubjectResult {
	gradepoint: string;
	equivalent_grade_point: number;
	subjectcode: string;
	"Progressive Grade Points Earned (Upto the current semester) ": string;
	minorsubject: string;
	passfail: string;
	creditEarnedInSemeseter: number;
	subjectdesc: string;
	course_credits: number;
	earned_credit: number;
	gradePointEarnedInSemeseter: string;
	cgpapoint: number;
	grade: string;
	sgpapoint: number;
	status: string;
}

export interface DetailedSemesterDataResponse {
	semesterList: SubjectResult[];
}

export interface SemesterReportBody {
	studentname: string;
	instituteid: string;
	studentinfolist: SubjectResult[];
	cgpa: number;
	sgpa: number;
	enrollmentno: string;
	programmcode: string;
	branchcode: string;
	stynumber: number;
	branchdesc: string;
	totalsgpa: number;
	totalearnedcredit: number;
	totalcoursecredit: number;
}

export interface Creds {
	otppwd: string;
	username: string;
	passwordotpvalue: string;
	Modulename: string;
}

export default class SoaPService {
	proxyOrigin = new URL(process.env.PROXY);
	rootUrl = new URL("https://soaportals.com/StudentPortalSOAAPI");
	passToken: string = "";

	public constructor(creds: Creds | string) {
		if (typeof creds === "string") {
			this.passToken = creds;
			return;
		}
		this.passToken = aesEnc(creds);
	}

	private getProxyUrl(url: URL): string {
		const proxyUrl = new URL(this.proxyOrigin);
		proxyUrl.searchParams.set("url", url.href);

		return proxyUrl.href;
	}

	async genToken(): Promise<Response<GenTokenResponse>> {
		const url = new URL(this.rootUrl.href + "/token/generate-token1");

		const req = new Request(this.getProxyUrl(url), {
			method: Method.Post,
			headers: {
				"Content-Type": "application/json",
				Signature: process.env.PROXY_SIGNATURE,
			},
			body: this.passToken,
		});

		const res = await fetch(req);
		return await this.setReturn<Response<GenTokenResponse>>(res);
	}

	async getPersonalInfo(token: string): Promise<Response<PersonalInfoResponse>> {
		const url = new URL(this.rootUrl.href + "/studentpersinfo/getstudent-personalinformation");

		const req = new Request(this.getProxyUrl(url), {
			method: Method.Post,
			headers: {
				"Content-Type": "application/json",
				Signature: process.env.PROXY_SIGNATURE,
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify({
				clientid: process.env.CLIENT_ID,
				instituteid: process.env.INSTITUTE_ID,
			}),
		});

		const res = await fetch(req);
		return await this.setReturn<Response<PersonalInfoResponse>>(res);
	}

	async getAttendanceSemList(token: string): Promise<Response<SemListResponse>> {
		const url = new URL(this.rootUrl + "/StudentClassAttendance/getstudentInforegistrationforattendence");

		const req = new Request(this.getProxyUrl(url), {
			method: Method.Post,
			headers: {
				"Content-Type": "application/json",
				Signature: process.env.PROXY_SIGNATURE,
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify({
				instituteid: process.env.INSTITUTE_ID,
			}),
		});

		const res = await fetch(req);
		return await this.setReturn<Response<SemListResponse>>(res);
	}

	async getAttendance(token: string, regId: string): Promise<Response<AttendanceResponse>> {
		const url = new URL(this.rootUrl + "/StudentClassAttendance/getstudentattendancedetail");

		const req = new Request(this.getProxyUrl(url), {
			method: Method.Post,
			headers: {
				"Content-Type": "application/json",
				Signature: process.env.PROXY_SIGNATURE,
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify({
				instituteid: process.env.INSTITUTE_ID,
				registrationid: regId,
			}),
		});

		const res = await fetch(req);
		return await this.setReturn<Response<AttendanceResponse>>(res);
	}

	async getAllSemesterData(token: string): Promise<Response<SemesterDataResponse>> {
		const url = new URL(this.rootUrl + "/studentsgpacgpa/getallsemesterdata");

		const req = new Request(this.getProxyUrl(url), {
			method: Method.Post,
			headers: {
				"Content-Type": "application/json",
				Signature: process.env.PROXY_SIGNATURE,
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify({
				instituteid: process.env.INSTITUTE_ID,
			}),
		});

		const res = await fetch(req);
		return await this.setReturn<Response<SemesterDataResponse>>(res, true);
	}

	private async getDetailedSemesterData(token: string, stynumber: number): Promise<Response<DetailedSemesterDataResponse>> {
		const url = new URL(this.rootUrl + "/studentsgpacgpa/getallsemesterdatadetail");
		const req = new Request(this.getProxyUrl(url), {
			method: Method.Post,
			headers: {
				"Content-Type": "application/json",
				Signature: process.env.PROXY_SIGNATURE,
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify({
				instituteid: process.env.INSTITUTE_ID,
				stynumber: stynumber,
			}),
		});

		const res = await fetch(req);
		return await this.setReturn<Response<DetailedSemesterDataResponse>>(res, true);
	}

	private async loadData(token: string): Promise<Response<StudentInfoResponse>> {
		const url = new URL(this.rootUrl + "/studentsgpacgpa/loadData");

		const req = new Request(this.getProxyUrl(url), {
			method: Method.Post,
			headers: {
				"Content-Type": "application/json",
				Signature: process.env.PROXY_SIGNATURE,
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify({
				instituteid: process.env.INSTITUTE_ID,
			}),
		});

		const res = await fetch(req);
		return await this.setReturn<Response<StudentInfoResponse>>(res);
	}

	private throwError(obj: Response<any>) {
		if (!obj?.status?.responseStatus) throw new Error(Err.ErrFormat);
		if (obj.status.responseStatus !== "Success") throw new Error(Err.ErrFailRes);
		if (!obj?.response) throw new Error(Err.ErrFormat);
	}

	async getSemesterResultPdf(token: string, stynumber: number): Promise<ArrayBuffer> {
		const url = new URL(this.rootUrl + "/studentsgpacgpa/semesterwisestudentresultreport");

		const semDetail = await this.getDetailedSemesterData(token, stynumber);
		this.throwError(semDetail);

		const studentInfo = await this.loadData(token);
		this.throwError(studentInfo);

		const allSemDetail = await this.getAllSemesterData(token);
		this.throwError(allSemDetail);

		const thisSem = allSemDetail.response.semesterList.filter((d) => d.stynumber === stynumber)[0];
		const totalsgpa = semDetail.response.semesterList.reduce((prev, curr) => curr.sgpapoint + prev, 0);

		const payload = aesEnc({
			studentname: studentInfo.response.studentInfo[0].name,
			instituteid: studentInfo.response.studentInfo[0].instituteid,
			studentinfolist: semDetail.response.semesterList,
			sgpa: thisSem.sgpa,
			cgpa: thisSem.cgpa,
			enrollmentno: studentInfo.response.studentInfo[0].enrollmentno,
			programmcode: studentInfo.response.studentInfo[0].programcode,
			branchcode: studentInfo.response.studentInfo[0].branchcode,
			stynumber: stynumber,
			branchdesc: studentInfo.response.studentInfo[0].branchdesc,
			totalsgpa: totalsgpa,
			totalearnedcredit: thisSem.totalearnedcredit,
			totalcoursecredit: thisSem.totalcoursecredit,
		} satisfies SemesterReportBody);

		const req = new Request(this.getProxyUrl(url), {
			method: Method.Post,
			headers: {
				"Content-Type": "application/json",
				Signature: process.env.PROXY_SIGNATURE,
				Authorization: `Bearer ${token}`,
			},
			body: payload,
		});

		const res = await fetch(req);
		if (!res.ok) {
			throw new Error(Err.ErrReqFail);
		}

		return await res.arrayBuffer();
	}

	private async setReturn<T>(res: globalThis.Response, isEnc: boolean = false) {
		let text = await res.text();
		text = text.trim();
		if (text === Err.ErrReqFail) {
			throw new Error(Err.ErrReqFail);
		}

		let data: string = text;
		if (isEnc) {
			const jsonData = JSON.parse(data);
			if (jsonData.status?.responseStatus === "Success" && typeof jsonData.response === "string") {
				const res = aesDec(jsonData.response);
				jsonData.response = JSON.parse(res);
			}
			return jsonData;
		}

		return JSON.parse(data) as T;
	}
}
