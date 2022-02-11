#!/usr/bin/env node
import { BasePipeline, BasePipelineProps, BaseStage, BaseStageProps } from "@base/app";
import { HelloWorldStack } from "@base/stacks";
import { App } from "aws-cdk-lib";
import { Construct } from "constructs";

class Phase extends BaseStage {
	constructor(scope: Construct, id: string, props?: BaseStageProps) {
		super(scope, id, props ?? {});
		new HelloWorldStack(this, this.__("Hello world"));
	}
}

class Project extends BasePipeline {
	constructor(scope: Construct, id: string, props: BasePipelineProps) {
		super(scope, id, props);
		const { pipeline } = this;

		const sandbox = new Phase(this, "sandbox", {});
		pipeline.addStage(sandbox);

		const production = new Phase(this, "production", {});
		pipeline.addStage(production);
	}
}

const app = new App();
new Project(app, app.node.tryGetContext("APP_NAME"), {
	rootZone: true
});

export {};
