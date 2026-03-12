import { aesEnc } from "../utils";
import { Method } from "./service";

interface Status {
	responseStatus: "Success" | "Failure";
	errors: string[] | null;
	identifier: string | null;
}

interface Response<T> {
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

export interface PersonalInfoData {
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

export interface Institute {
	label: string;
	value: string;
}

export interface Creds {
	otppwd: string;
	username: string;
	passwordotpvalue: string;
	Modulename: string;
}

export const enum Err {
	ErrFormat = "INVALID_FORMAT",
	ErrNoURL = "NO_URL",
	ErrInvalidURL = "INVALID_URL",
	ErrReqFail = "REQ_FAILED",
	ErrAuth = "UNAUTHORIZED",
}

export default class Service {
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
		return await res.json<Response<GenTokenResponse>>();
	}

	async getPersonalInfo(token: string): Promise<Response<PersonalInfoData>> {
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
		return await res.json<Response<PersonalInfoData>>();
	}
}
