import { RemovalPolicy } from "aws-cdk-lib";
import { Bucket } from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";
import { BaseStack, BaseStackProps } from "@base/app";

export class HelloWorldStack extends BaseStack {
	constructor(scope: Construct, id: string, props?: BaseStackProps) {
		super(scope, id, props);
		new Bucket(this, this.__("hello world bucket"), {
			removalPolicy: RemovalPolicy.DESTROY,
			autoDeleteObjects: true
		});
	}
}
