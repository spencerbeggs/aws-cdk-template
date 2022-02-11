# AWS CDK Template

This repo is a [GitHub Template](https://docs.github.com/en/repositories/creating-and-managing-repositories/creating-a-repository-from-a-template) that you can clone into your own GitHub account that provides a sensible workspace for quickly bootstrapping, testing and deploying infrastructure with [AWS Cloud Development Kit (CDK)](https://docs.aws.amazon.com/cdk/index.html) with [TypeScript](https://www.typescriptlang.org/).

The workspace uses [AWS CDK v2](https://docs.aws.amazon.com/cdk/v2/guide/migrating-v2.html) includes the base `aws-cdk-lib` and all the `@aws-cdk/{module}-alpha` packages.

## UsaInstallationge

This repo manages dependencies with yarn and includes a bootstrapping script to reset this repo and configure

```bash
npm install --global yarn
yarn install
yarn bootstrap
```
