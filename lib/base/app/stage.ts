import slugify from "@sindresorhus/slugify";
import { Stage, StageProps } from "aws-cdk-lib";
import { Construct } from "constructs";

export interface BaseStageProps extends StageProps {
	single?: boolean;
}

export class BaseStage extends Stage {
	public _stage: string;
	public _single: boolean;
	constructor(scope: Construct, id: string, props?: BaseStageProps) {
		super(scope, id, props);
		const { single = BaseStage.single } = props ?? {};
		this._single = single;
		this._stage = id;
	}

	static single = true;

	/**
	 * Namespace helper function to automatically generate scoped ids for child Constructs to prevent id collisions in loops or complex structures.
	 * Concatinates and slugifies a readable descrition with the instance of the BaseStack's stackType and stackEnv properties if the defined.
	 *
	 * @param name - The plain text description of Construct you want to transform into a scoped id, eg, "Logs Bucket"
	 * @param seperator - The string used seperate the parts of the scoped ID, defaults to "-"
	 * @returns Scoped id string to pass to child Construnct, eg, "logs-bucket-my-stack-type-production"
	 * @example
	 * Create a
	 * ```
	 * import { BaseStack, BaseStackProps } from "../lib/base";
	 * ```
	 *
	 */
	__ = (name: string, seperator: string = "-"): string => {
		return [name]
			.filter((part) => typeof part === "string")
			.map((part) => (part as string).trim())
			.map((part) => slugify(part as string))
			.join("-")
			.replace(/-/g, seperator);
	};

	public static stringify(parts: unknown[], replacement: string = "-"): string {
		return parts
			.filter((part) => typeof part === "string")
			.map((part) => slugify(part as string))
			.join("-")
			.replace(/-/g, replacement);
	}
}
