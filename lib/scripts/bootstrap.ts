import { exec } from "child_process";
import { writeFile, readFile } from "fs/promises";
import { promisify } from "util";
import slugify from "@sindresorhus/slugify";
import inquirer, { QuestionCollection } from "inquirer";
import { Observable } from "rxjs";
import semver from "semver";
import validatePackageName from "validate-npm-package-name";

const execAsync = promisify(exec);

async function run(cmd: string): Promise<string> {
	const { stdout } = await execAsync(cmd);
	return stdout.trim();
}

async function getRemote(): Promise<string> {
	let remote = await run("git config --get remote.origin.url");
	if (remote.startsWith("git@github.com:")) {
		remote = `https://github.com/${remote.replace("git@github.com:", "").trim()}`;
	}
	return remote;
}

async function getRepo() {
	const remote = await getRemote();
	const arr = remote.split("/");
	const repo = arr.pop()?.replace(".git", "");
	const org = arr.pop();
	return `${org}/${repo}`;
}

async function writeJson(url: URL, data = {}) {
	let content;
	try {
		const original = await readFile(url, { encoding: "utf-8" });
		content = JSON.parse(original);
	} catch (err) {
		content = {};
	} finally {
		await writeFile(url, JSON.stringify(Object.assign(content, data), null, "\t") + "\n", {
			encoding: "utf-8"
		});
	}
}

async function rewriteConfig({ pkg, context }: Results) {
	const packageUrl = new URL("../../package.json", import.meta.url);
	await writeJson(packageUrl, pkg);
	const contextUrl = new URL("../../cdk.context.json", import.meta.url);
	await writeJson(contextUrl, context);
	const contextRootUrl = new URL("../../cdk.json", import.meta.url);
	await writeJson(contextRootUrl, {
		app: "node --no-warnings --experimental-specifier-resolution=node --loader ts-paths-esm-loader src/root.ts",
		context: {
			"aws-cdk:enableDiffNoFail": "true",
			"@aws-cdk/core:newStyleStackSynthesis": "true",
			"@aws-cdk/core:stackRelativeExports": "true",
			"@aws-cdk/aws-apigateway:usagePlanKeyOrderInsensitiveId": true,
			"@aws-cdk/aws-ecr-assets:dockerIgnoreSupport": true,
			"@aws-cdk/aws-secretsmanager:parseOwnedSecretName": true,
			"@aws-cdk/aws-kms:defaultKeyPolicies": true,
			"@aws-cdk/aws-ecs-patterns:removeDefaultDesiredCount": true,
			"@aws-cdk/aws-rds:lowercaseDbIdentifier": true,
			"@aws-cdk/aws-efs:defaultEncryptionAtRest": true
		}
	});
}

interface Results {
	pkg: Record<string, unknown>;
	context: Record<string, unknown>;
}

const questions: QuestionCollection = new Observable((obs) => {
	obs.next({
		type: "input",
		name: "app.title",
		message: "App title? (example: My CDK Stack)",
		default: async () => {
			return "My CDK Stack";
		},
		validate: (input: string) => {
			if (!input.length) {
				return "You must add an app title";
			}
			if (slugify(input) === "aws-cdk-template") {
				return `Don't name your app after the template repo. Choose something other than "AWS CDK Template"`;
			}
			return true;
		}
	});

	obs.next({
		type: "input",
		name: "pkg.name",
		message: "Package name? (use a valid npm package name)",
		default: async (answers) => {
			return slugify(answers.app.title);
		},
		validate: (input: string) => {
			if (input === "aws-cdk-template") {
				return `Don't name your app after the template repo. Choose something other than "aws-cdk-template"`;
			}
			const { validForNewPackages, errors = [] } = validatePackageName(input);
			if (!validForNewPackages) {
				return errors.join(" ");
			}
			return true;
		}
	});

	obs.next({
		type: "input",
		name: "pkg.description",
		message: "Package description? (write a brief explanation of what your package does)",
		default: async (answers: Record<string, Record<string, unknown>>) => {
			return `AWS CDK infrastructure for ${answers.app.title}`;
		},
		validate: (input: string) => {
			if (input.length < 1) {
				return "Write a short description for your pkg.";
			}
			return true;
		}
	});

	obs.next({
		type: "input",
		name: "pkg.version",
		message: "Package version? (use valid semver)",
		default: async () => {
			return "0.0.0";
		},
		validate: (input) => {
			return Boolean(semver.valid(input));
		}
	});

	obs.next({
		type: "list",
		name: "pkg.private",
		message: "Keep package private? (prevent accidental publishing to npm)",
		default: () => {
			return "true";
		},
		choices: [
			{
				name: "true",
				value: true
			},
			{
				name: "false",
				value: false
			}
		],
		validate: (input) => {
			return input === true || input === false;
		}
	});

	obs.next({
		type: "input",
		name: "pkg.author.name",
		message: "Package author name? (defaults to output of: git config user.name)",
		default: () => {
			return run("git config user.name");
		},
		validate: (input) => {
			return typeof input === "string" && input.length > 0;
		}
	});

	obs.next({
		type: "input",
		name: "pkg.author.email",
		message: "Package author email? (defaults to output of: git config user.email)",
		default: () => {
			return run("git config user.email");
		},
		validate: (input) => {
			return typeof input === "string" && input.length > 0;
		}
	});

	obs.next({
		type: "input",
		name: "pkg.repository.type",
		message: "Repository type?",
		default: async () => {
			return "git";
		},
		validate: (input) => {
			return typeof input === "string" && input.length > 0;
		}
	});

	obs.next({
		type: "input",
		name: "pkg.repository.url",
		message: "Repository URL? (the HTPPS GiHub url of the current repo)",
		default: async () => {
			const remote = await getRemote();
			return remote;
		},
		validate: (input) => {
			return typeof input === "string" && input.length > 0;
		}
	});

	obs.next({
		type: "input",
		name: "context.APP_NAME",
		message: "CDK app name? (will be the name of your stack or the base name of your pipeline)",
		default: async (answers) => {
			return answers.pkg.name;
		},
		validate: (input) => {
			if (input === "aws-cdk-template") {
				return `Don't name your app after the template repo. Choose something other than "aws-cdk-template"`;
			}
			const { validForNewPackages, errors = [] } = validatePackageName(input);
			if (!validForNewPackages) {
				return errors.join(" ");
			}
			return true;
		}
	});

	obs.next({
		type: "input",
		name: "context.AWS_ACCOUNT_ID",
		message: "AWS account ID? (default to the account ID of the current profile used by aws-cli)",
		default: async () => {
			const json = await run("aws sts get-caller-identity");
			const { Account } = JSON.parse(json);
			return Account;
		},
		validate: (input) => {
			return typeof input === "string" && input.length > 0;
		}
	});

	obs.next({
		type: "list",
		name: "context.AWS_REGION",
		message: "AWS region? (defaults the current region of the active profile returned by aws-cli)",
		default: async () => {
			const current = await run(
				"aws ec2 describe-availability-zones --output text --query 'AvailabilityZones[0].[RegionName]'"
			);
			return current;
		},
		choices: async () => {
			const json = await run("aws ec2 describe-regions --output json");
			const { Regions } = JSON.parse(json);
			return Regions.map(({ RegionName }) => RegionName);
		},
		validate: (input) => {
			return typeof input === "string" && input.length > 0;
		}
	});

	obs.next({
		type: "list",
		name: "cdk.pipeline.enabled",
		message: "Deploy infrastructure with CDK Pipelines?",
		default: async () => {
			return "true";
		},
		choices: async () => {
			return [
				{
					name: "true",
					value: true
				},
				{
					name: "false",
					value: false
				}
			];
		},
		validate: (input) => {
			return input === true || input === false;
		}
	});

	obs.next({
		type: "input",
		name: "context.PIPELINE_REPO",
		message: "GitHub repo to deploy pipeline? (default is the git current repo)",
		when: async (answers) => {
			return answers.cdk.pipeline.enabled;
		},
		default: async () => {
			const repo = await getRepo();
			return repo;
		},
		validate: (input) => {
			return typeof input === "string" && input.length > 0;
		}
	});

	obs.next({
		type: "list",
		name: "context.PIPELINE_BRANCH",
		message: "Pipeline repo branch? (default is the current branch)",
		when: async (answers) => {
			return answers.cdk.pipeline.enabled;
		},
		default: async () => {
			const current = await run("git rev-parse --abbrev-ref HEAD");
			return current;
		},
		choices: async () => {
			const text = await run("git ls-remote");
			return text.split("\n").reduce((acc, line) => {
				if (line.includes("refs/heads/")) {
					const arr = line.split("refs/heads/");
					const branch = arr.pop().trim();
					acc.push({
						name: branch,
						value: branch
					});
				}
				return acc;
			}, []);
		},
		validate: (input) => {
			return typeof input === "string" && input.length > 0;
		}
	});

	obs.next({
		type: "input",
		name: "context.PIPELINE_TOKEN_NAME",
		message: "Name of GitHub Oauth token saved in SecretsManager?",
		when: async (answers) => {
			return answers.cdk.pipeline.enabled;
		},
		default: async () => {
			return "github-oauth-token";
		},
		validate: (input) => {
			return typeof input === "string" && input.length > 0;
		}
	});

	obs.next({
		type: "list",
		name: "cdk.pipeline.zone",
		message: "Add a default Route53 hosted zone to Pipeline Project?",
		when: async (answers) => {
			return answers.cdk.pipeline.enabled;
		},
		default: async () => {
			return "true";
		},
		choices: async () => {
			return [
				{
					name: "true",
					value: true
				},
				{
					name: "false",
					value: false
				}
			];
		},
		validate: (input) => {
			return input === true || input === false;
		}
	});

	obs.next({
		type: "list",
		name: "context.PIPELINE_ZONE_ID",
		message: "Hosted zone for pipeline?",
		when: async (answers) => {
			return answers.cdk.pipeline.enabled && answers.cdk.pipeline.zone;
		},
		default: async () => {
			const json = await run("aws route53 list-hosted-zones --output json");
			const { HostedZones } = JSON.parse(json);

			return HostedZones.reduce(
				(acc, { Name, ResourceRecordSetCount }) => {
					if (!acc.Name || ResourceRecordSetCount > acc.ResourceRecordSetCount) {
						acc = {
							Name,
							ResourceRecordSetCount
						};
					}
					return acc;
				},
				{ Name: "", ResourceRecordSetCount: 0 }
			).Name;
		},
		choices: async () => {
			const json = await run("aws route53 list-hosted-zones --output json");
			const { HostedZones } = JSON.parse(json);
			return HostedZones.sort((a, b) => {
				if (a.ResourceRecordSetCount > b.ResourceRecordSetCount) {
					return -1;
				} else if (a.ResourceRecordSetCount < b.ResourceRecordSetCount) {
					return 1;
				} else {
					return 0;
				}
			}).map(({ Id, Name }) => ({
				name: Name,
				value: Id.split("/").pop()
			}));
		},
		validate: (input) => {
			return typeof input === "string" && input.length > 0;
		}
	});

	obs.complete();
});

const answers = await inquirer.prompt<Results>(questions);
if (answers?.context?.PIPELINE_ZONE_ID) {
	const json = await run(`aws route53 get-hosted-zone --id ${answers.context.PIPELINE_ZONE_ID} --output json`);
	const {
		HostedZone: { Name }
	} = JSON.parse(json);
	answers.context.PIPELINE_ZONE_NAME = Name;
}

await rewriteConfig(answers);
