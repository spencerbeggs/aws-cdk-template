import semver from "semver";
import { getPackageJson } from "../helpers/package-json";

const pkg = await getPackageJson();
const target = pkg.engines?.node ?? "missing";

if (!semver.satisfies(process.version, target)) {
	throw new Error(`The current node version ${process.version} does not satisfy the required version ${target} .`);
}

export {};
