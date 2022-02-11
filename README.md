# AWS CDK Template

This repo is a [GitHub Template](https://docs.github.com/en/repositories/creating-and-managing-repositories/creating-a-repository-from-a-template) that you can clone into your own GitHub account that provides a sensible workspace for quickly bootstrapping, testing and deploying infrastructure with [AWS Cloud Development Kit (CDK)](https://docs.aws.amazon.com/cdk/index.html) with [TypeScript](https://www.typescriptlang.org/).

The workspace uses [AWS CDK v2](https://docs.aws.amazon.com/cdk/v2/guide/migrating-v2.html) and includes the base `aws-cdk-lib` and all the `@aws-cdk/{module}-alpha` packages.

## Quickstart

This repository contains a cli script to quickly reset a repo that is cloned from the template and prepare it to be deployed to AWS. The script assumes that you have [Node.js v16.14.0](https://nodejs.org/dist/v16.14.0/), [yarn v1.22.17](https://yarnpkg.com/), [AWS CDK v2][https://docs.aws.amazon.com/cdk/v2/guide/getting_started.html](AWS CLI v2), (<https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html>) and [git](https://git-scm.com/downloads) available in your workspace. If you do not, a step-by-step installation and explanation is available in the next section. If you do:

```bash
yarn install
yarn bootstrap
cdk bootstrap # if you have not bootstrapped your CDK env yet
git commit -m "Bootstraped template repo"
git push origin
cdk deploy
```
