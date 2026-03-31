import z from "zod";
import { Err } from "../constants";
import { aesEnc } from "../utils";
import { Method } from "./service";
import { resolveTypeIssues } from "./types";
import {
	Attendance,
	AttendanceResponse,
	Creds,
	GenTokenResponse,
	Institute,
	PersonalInfoResponse,
	Response,
	Sem,
	SemListResponse,
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

	private async setReturn<T>(res: globalThis.Response, type: z.ZodType<T>) {
		let text = await res.text();
		text = text.trim();
		this.handleProxyErrs(text);
		console.log(text);

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
