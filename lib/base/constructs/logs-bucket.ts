import { RemovalPolicy } from "aws-cdk-lib";
import { Bucket } from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";
import { BaseConstruct, BaseConstructProps } from "@base/app";

export interface LogsBucketProps extends BaseConstructProps {
	removalPolicy?: RemovalPolicy;
	autoDeleteObjects?: boolean;
}

export class LogsBucket extends BaseConstruct {
	public readonly bucket: Bucket;
	constructor(scope: Construct, id: string, props?: LogsBucketProps) {
		super(scope, id, props);
		const { removalPolicy, autoDeleteObjects } = props ?? {};
		this.bucket = new Bucket(this, this.__("logs bucket"), {
			removalPolicy: removalPolicy ?? LogsBucket.removalPolicy,
			autoDeleteObjects: autoDeleteObjects ?? LogsBucket.autoDeleteObjects
		});
	}
	static removalPolicy = RemovalPolicy.DESTROY;
	static autoDeleteObjects = true;
}
