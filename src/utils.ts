import CryptoJS from "crypto-js";

const key = CryptoJS.enc.Utf8.parse(process.env.KEY);
const iv = CryptoJS.enc.Utf8.parse(process.env.IV);

export function aesEnc(data: {}): string {
	const encrypted = CryptoJS.AES.encrypt(JSON.stringify(data), key, {
		iv,
		mode: CryptoJS.mode.CBC,
		padding: CryptoJS.pad.Pkcs7,
	});

	return encrypted.toString();
}

export function aesDec(data: string) {
	const decrypted = CryptoJS.AES.decrypt(data, key, {
		iv,
		mode: CryptoJS.mode.CBC,
		padding: CryptoJS.pad.Pkcs7,
	});

	return decrypted.toString(CryptoJS.enc.Utf8);
}

export function text(text: string): string {
	return text.replace(/^\t+/gm, "");
}
