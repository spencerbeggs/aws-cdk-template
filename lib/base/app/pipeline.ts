import slugify from "@sindresorhus/slugify";
import { SecretValue, Stack, StackProps } from "aws-cdk-lib";
import { HostedZone, HostedZoneAttributes, IHostedZone } from "aws-cdk-lib/aws-route53";
import { Bucket } from "aws-cdk-lib/aws-s3";
import { CodePipeline, CodePipelineSource, ShellStep } from "aws-cdk-lib/pipelines";
import { Construct } from "constructs";
import { LogsBucket } from "@base/constructs";

export interface BasePipelineProps extends StackProps {
	logs?: boolean;
	repo?: string;
	branch?: string;
	tokenName?: string;
	rootZone?: HostedZoneAttributes | IHostedZone | boolean;
	hostedZoneId?: string;
	zoneName?: string;
}

export class BasePipeline extends Stack {
	public readonly _app_name: string;
	public pipeline: CodePipeline;
	public readonly hostedZone?: IHostedZone;
	public readonly logs?: Bucket;
	public project: this;
	constructor(scope: Construct, id: string, props?: BasePipelineProps) {
		if (!props) {
			props = {
				rootZone: BasePipeline.rootZone,
				logs: BasePipeline.logs
			};
		}
		super(
			scope,
			`${id}-pipeline`,
			Object.assign(
				{
					env: {
						account: scope.node.tryGetContext("AWS_ACCOUNT_ID"),
						region: scope.node.tryGetContext("AWS_REGION")
					},
					hostedZoneId: scope.node.tryGetContext("PIPELINE_ZONE_ID"),
					zoneName: scope.node.tryGetContext("PIPELINE_ZONE_NAME")
				},
				props
			)
		);
		const { rootZone, hostedZoneId, zoneName, logs } = props;
		const repo = props.repo ?? scope.node.tryGetContext("PIPELINE_REPO");
		const branch = props.branch ?? scope.node.tryGetContext("PIPELINE_BRANCH") ?? "main";
		const tokenName = props.tokenName ?? scope.node.tryGetContext("PIPELINE_TOKEN_NAME") ?? "github-oauth-token";
		this._app_name = id;
		this.pipeline = new CodePipeline(this, this.__("pipeline"), {
			pipelineName: `${id}-pipeline`,
			synth: new ShellStep(this.__("synth"), {
				input: CodePipelineSource.gitHub(repo, branch, {
					authentication: SecretValue.secretsManager(tokenName)
				}),
				commands: ["yarn install --frozen-lockfile", "npx cdk synth"]
			})
		});

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		function isZoneLookup(object: any): object is HostedZoneAttributes {
			return "hostedZoneId" in object && "zoneName" in object;
		}

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		function isZone(object: any): object is IHostedZone {
			return "hostedZoneId" in object && "zoneName" in object;
		}
		if (rootZone === true && hostedZoneId && zoneName) {
			this.hostedZone = HostedZone.fromHostedZoneAttributes(this, this.__("root hosted zone"), {
				hostedZoneId,
				zoneName
			});
		} else if (rootZone && isZoneLookup(rootZone) && !hostedZoneId && !zoneName) {
			this.hostedZone = HostedZone.fromHostedZoneAttributes(this, this.__("root hosted zone"), rootZone);
		} else if (rootZone && isZone(rootZone) && !hostedZoneId && !zoneName) {
			this.hostedZone = rootZone;
		}

		if (logs) {
			const { bucket } = new LogsBucket(this, this.__("logs"));
			this.logs = bucket;
		}
		this.project = this;
	}

	static rootZone = false;
	static logs = true;

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
		return [this._app_name, name]
			.filter((part) => typeof part === "string")
			.map((part) => (part as string).trim())
			.map((part) => slugify(part as string))
			.join("-")
			.replace(/-/g, seperator);
	}
}
