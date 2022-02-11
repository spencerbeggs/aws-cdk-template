import slugify from "@sindresorhus/slugify";
import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { BasePipeline } from "./pipeline";
import { BaseStage } from "./stage";

export interface BaseStackProps extends StackProps {
	stackType?: string;
	stackEnv?: string;
}

export class BaseStack extends Stack {
	public readonly stackType?: string;
	public readonly stackEnv?: string;
	constructor(scope: Construct, id: string, props?: BaseStackProps) {
		const app_name = scope.node.scopes
			.reverse()
			.filter((scope) => scope instanceof BasePipeline)
			.map((scope) => (scope as BasePipeline)._app_name)
			.shift();
		const stage = scope.node.scopes
			.reverse()
			.filter((scope) => scope instanceof BaseStage)
			.map((scope) => scope as BaseStage)
			.shift();
		const stage_name = stage?._stage;
		const stack_name = BaseStack.stringify([app_name, !stage?._single ? id : null, stage_name]);
		super(
			scope,
			stack_name,
			Object.assign(
				{
					stackName: stack_name,
					env: {
						account: scope.node.tryGetContext("AWS_ACCOUNT_ID"),
						region: scope.node.tryGetContext("AWS_REGION")
					}
				},
				props ?? {}
			)
		);
		this.stackType = props && props.stackType ? props.stackType : undefined;
		this.stackEnv = props && props.stackEnv ? props.stackEnv : undefined;
	}

	public static stringify(parts: unknown[], replacement: string = "-"): string {
		return parts
			.filter((part) => typeof part === "string")
			.map((part) => slugify(part as string))
			.join("-")
			.replace(/-/g, replacement);
	}

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
	__(name: string, seperator: string = "-"): string {
		return [name, this.stackType, this.stackEnv]
			.filter((part) => typeof part === "string")
			.map((part) => (part as string).trim())
			.map((part) => slugify(part as string))
			.join("-")
			.replace(/-/g, seperator);
	}
}
