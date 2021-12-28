import { readFile } from "fs/promises";
import { URL } from "url";
import type { PackageJson } from "type-fest";

export const getPackageJson = async (): Promise<PackageJson> => {
	return JSON.parse(await readFile(new URL("../../package.json", import.meta.url), { encoding: "utf-8" }));
};
