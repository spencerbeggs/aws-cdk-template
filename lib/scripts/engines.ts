import { readFile } from "fs/promises";
import semver from "semver";
import type { PackageJson } from "type-fest";

export const getPackageJson = async (): Promise<PackageJson> => {
	return JSON.parse(await readFile(new URL("../../package.json", import.meta.url), { encoding: "utf-8" }));
};

const pkg = await getPackageJson();
const target = pkg?.engines?.["node"] ?? "missing";

if (process.env.IS_CODEBUILD !== "true" && !semver.satisfies(process.version, target)) {
	throw new Error(`The current node version ${process.version} does not satisfy the required version ${target} .`);
}

export {};
