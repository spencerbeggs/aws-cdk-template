export const sleep = (delay: number) => new Promise((res) => setTimeout(res, delay, undefined));

export const hello = async (msg: string, delay: number) => {
	await sleep(delay);
	console.log(msg);
};
