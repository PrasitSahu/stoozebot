import { expect, test, vi } from "vitest";
import SoaPService from "../src/services/soaPortals";

vi.mock("../src/services/soaPortals");

test("check SoaPService mock structure", () => {
	console.log("SoaPService:", SoaPService);
	console.log("Type of SoaPService:", typeof SoaPService);
	console.log("SoaPService.default:", (SoaPService as any).default);

	try {
		(SoaPService as any).mockImplementation(() => ({}));
		console.log("mockImplementation worked on SoaPService");
	} catch (e: any) {
		console.log("mockImplementation failed on SoaPService:", e.message);
	}

	try {
		(SoaPService as any).default.mockImplementation(() => ({}));
		console.log("mockImplementation worked on SoaPService.default");
	} catch (e: any) {
		console.log("mockImplementation failed on SoaPService.default:", e.message);
	}
});
