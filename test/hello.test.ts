import "jest-console";
import { hello } from "../src/hello";

describe("Hello, world!", () => {
	it("Logs your message", async () => {
		const msg = "Hello, world!";
		await expect(hello(msg, 100)).resolves.toBe(undefined);
		expect(console.log).toHaveBeenCalledTimes(1);
		expect(console.log).toHaveBeenCalledWith(msg);
	});
});
