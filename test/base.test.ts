import { App } from "aws-cdk-lib";
import { BaseConstruct, BaseStack } from "@base/app";

describe("Base components", () => {
	describe("BaseStack namehelper", () => {
		let app: App;
		beforeEach(() => {
			app = new App();
		});
		it("builds an id for a child construct by slugifying as string", () => {
			const stack = new BaseStack(app, "stack");
			const child = new BaseConstruct(stack, stack.__("Foo Bar"));
			expect(child.node.id).toBe("foo-bar");
		});
		it("passing a string as the second argument changes the seperator between id parts", () => {
			const stack = new BaseStack(app, "stack");
			const child = new BaseConstruct(stack, stack.__("Foo Bar", "_"));
			expect(child.node.id).toBe("foo_bar");
		});
		it("if the stackType prop is passed, it is appended as a slug", () => {
			const stack = new BaseStack(app, "stack", {
				stackType: "My Type"
			});
			const child = new BaseConstruct(stack, stack.__("Foo Bar"));
			expect(child.node.id).toBe("foo-bar-my-type");
		});
		it("if the stackEnv prop is passed, it is appended as a slug", () => {
			const stack = new BaseStack(app, "stack", {
				stackType: "My Type",
				stackEnv: "User Acceptance"
			});
			const child = new BaseConstruct(stack, stack.__("Foo Bar"));
			expect(child.node.id).toBe("foo-bar-my-type-user-acceptance");
		});
	});
	describe("BaseConstruct namehelper", () => {
		let app: App;
		let stack: BaseStack;
		let child: BaseConstruct;
		let nested: BaseConstruct;
		let skipped: BaseConstruct;
		let deeplyNested: BaseConstruct;
		beforeEach(() => {
			app = new App();
			stack = new BaseStack(app, "stack", {
				stackType: "Demo",
				stackEnv: "QA"
			});
		});
		it("builds an id for a nested child construct by concatinating a slugified string appending an optional env recursively with parted BaseConstruct instance env with the parent stack's stackType and stackEnv props", () => {
			child = new BaseConstruct(stack, stack.__("Child Construct"));
			nested = new BaseConstruct(stack, child.__("Nested Construct"));
			expect(child.node.id).toBe("child-construct-demo-qa");
			expect(nested.node.id).toBe("nested-construct-demo-qa");
		});
		it("passing a second argument controls spacing between parts", () => {
			child = new BaseConstruct(stack, stack.__("Child Construct", "_"));
			nested = new BaseConstruct(stack, child.__("Nested Construct", "_"));
			expect(child.node.id).toBe("child_construct_demo_qa");
			expect(nested.node.id).toBe("nested_construct_demo_qa");
		});
		it("recursively appends the envs of ancestor BaseConstruct parents envs (optional) and then appends the parent stack's stackType and stackEnv props", () => {
			child = new BaseConstruct(stack, stack.__("Child Construct"), {
				env: "One"
			});
			skipped = new BaseConstruct(child, child.__("Child Construct"));
			nested = new BaseConstruct(skipped, skipped.__("Nested Construct"), {
				env: "Two"
			});
			deeplyNested = new BaseConstruct(nested, nested.__("Deeply Nested Construct"));
			expect(child.node.id).toBe("child-construct-demo-qa");
			expect(nested.node.id).toBe("nested-construct-one-demo-qa");
			expect(deeplyNested.node.id).toBe("deeply-nested-construct-two-one-demo-qa");
		});
	});
});
