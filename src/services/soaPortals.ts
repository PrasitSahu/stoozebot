import z from "zod";
import { Err } from "../constants";
import { aesDec, aesEnc } from "../utils";
import { Method } from "./service";
import { resolveTypeIssues } from "./types";
import {
	Attendance,
	AttendanceResponse,
	Creds,
	DetailedSemesterDataResponse,
	GenTokenResponse,
	Institute,
	PersonalInfoResponse,
	Response,
	Sem,
	SemesterData,
	SemesterDataResponse,
	SemesterReportBody,
	SemListResponse,
	StudentInfoResponse,
	SubjectResult,
} from "./types";

export type Response<T> = z.infer<ReturnType<typeof Response<z.ZodType<T>>>>;
export type GenTokenResponse = z.infer<typeof GenTokenResponse>;
export type PersonalInfoResponse = z.infer<typeof PersonalInfoResponse>;
export type Sem = z.infer<typeof Sem>;
export type SemListResponse = z.infer<typeof SemListResponse>;
export type Attendance = z.infer<typeof Attendance>;
export type AttendanceResponse = z.infer<typeof AttendanceResponse>;
export type Institute = z.infer<typeof Institute>;
export type Creds = z.infer<typeof Creds>;
export type StudentInfoResponse = z.infer<typeof StudentInfoResponse>;
export type SemesterData = z.infer<typeof SemesterData>;
export type SemesterDataResponse = z.infer<typeof SemesterDataResponse>;
export type SubjectResult = z.infer<typeof SubjectResult>;
export type DetailedSemesterDataResponse = z.infer<typeof DetailedSemesterDataResponse>;
export type SemesterReportBody = z.infer<typeof SemesterReportBody>;

export default class SoaPService {
	proxyOrigin = new URL(process.env.PROXY);
	rootUrl = new URL("https://soaportals.com/StudentPortalSOAAPI");
	passToken: string = "";

	public constructor(creds: Creds | string, others: { proxyUrl: string } = { proxyUrl: process.env.PROXY }) {
		if (typeof creds === "string") {
			this.passToken = creds;
			return;
		}
		this.passToken = aesEnc(creds);
		this.proxyOrigin = new URL(others.proxyUrl);
	}

	private getProxyUrl(url: URL): string {
		const proxyUrl = new URL(process.env.PROXY);
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
		return await this.setReturn<GenTokenResponse>(res, GenTokenResponse);
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
		return await this.setReturn<PersonalInfoResponse>(res, PersonalInfoResponse);
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
		return await this.setReturn<SemListResponse>(res, SemListResponse);
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
		return await this.setReturn<AttendanceResponse>(res, AttendanceResponse);
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
		return await this.setReturn(res, SemesterDataResponse, true);
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
		return await this.setReturn(res, DetailedSemesterDataResponse, true);
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
		return await this.setReturn(res, StudentInfoResponse);
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

	private async setReturn<T>(res: globalThis.Response, type: z.ZodType<T>, isEnc: boolean = false) {
		let text = await res.text();
		text = text.trim();
		this.handleProxyErrs(text);

		if (isEnc) {
			const jsonData = JSON.parse(text);
			if (jsonData?.status?.responseStatus === "Success" && typeof jsonData.response === "string") {
				const res = aesDec(jsonData.response);
				jsonData.response = JSON.parse(res);
			}
			return jsonData;
		}

		try {
			const parsedResponse = Response(type).parse(JSON.parse(text));
			return parsedResponse;
		} catch (error) {
			if (error instanceof Error) {
				if (error instanceof z.ZodError) {
					resolveTypeIssues(error.issues);
				}

				if (error instanceof SyntaxError) {
					console.error("failed to parse json for request: ", type.meta());
					console.error(error);
				}
			}
			throw error;
		}
	}

	private handleProxyErrs(text: string) {
		switch (text) {
			case Err.ErrReqFail:
				throw new Error(Err.ErrReqFail);
			case Err.ErrInvalidURL:
				throw new Error(Err.ErrInvalidURL);
			case Err.ErrNoURL:
				throw new Error(Err.ErrNoURL);
			case Err.ErrAuth:
				throw new Error(Err.ErrAuth);
		}
	}
}
