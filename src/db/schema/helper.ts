import KSUID from "ksuid";

export function createId(): string {
	return KSUID.randomSync().string;
}
