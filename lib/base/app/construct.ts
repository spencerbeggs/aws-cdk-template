import slugify from "@sindresorhus/slugify";
import { Stack } from "aws-cdk-lib";
import { Construct } from "constructs";
import { BaseStack } from "@base/app";

export interface BaseConstructProps {
	env?: string;
}

export class BaseConstruct extends Construct {
	public _env?: string;
	constructor(scope: Construct, id: string, props?: BaseConstructProps) {
		super(scope, id);
		this.helpers = props ?? {};
	}
	set helpers(props: BaseConstructProps) {
		this._env = props.env;
	}
	get env(): string | undefined {
		return this._env;
	}
	static seperator = "-";
	public static stringify(parts: unknown[], replacement: string = "-"): string {
		return parts
			.filter((part) => typeof part === "string")
			.map((part) => slugify(part as string))
			.join("-")
			.replace(/-/g, replacement);
	}

	__ = (name: string, replacement: string = "-"): string => {
		const stack = Stack.of(this) as BaseStack;
		return BaseConstruct.stringify(
			[
				name,
				...this.node.scopes
					.reverse()
					.filter((scope) => scope instanceof BaseConstruct)
					.map((scope) => (scope as BaseConstruct).env),
				stack.stackType,
				stack.stackEnv
			],
			replacement
		);
	};
}
