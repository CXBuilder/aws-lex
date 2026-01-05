# Change Log

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## 1.3.1 (2026-01-05)

- Updated aws-cdk to 2.1100.2, aws-cdk-lib to 2.233.0, and constructs to 10.4.4

## 1.3.0 (2025-12-16)

- ivan.bliskavka
  - Added `connectInstanceArn` to BotProps to simplify Amazon Connect association
  - Added `BotReplica` to simplify bot configuration in the replica region
  - Updated CI/CD process to automatically create releases

## 1.2.1 (2025-09-26)

- ivan.bliskavka
  - Fixed bug. Conversation log was not configured if LogGroup parameter was not passed in.

## 1.2.0 (2025-08-22)

- ivan.bliskavka
  - Create a bot log group by default. Pass `false` to disable.
  - Add `throttleDeploy` function to handle Lex API throttling issues when deploying multiple bots.

## 1.1.1 (2025-07-28)

- ivan.bliskavka
  - Expose `replicaRegions` props for Global Resiliency

## 1.1.0 (2025-07-10)

- ivan.bliskavka
  - Added Intent `confirmationFailurePrompt` and `fulfillmentFailurePrompt`
  - Automatically allow all aliases to call the codehook lambda

## 1.0.2 (2025-06-06)

- ivan.bliskavka
  - Python example in readme is redundant. ConstructHub automatically makes the conversion

## 1.0.1 (2025-06-06)

- ivan.bliskavka
  - Enhanced README with comprehensive examples and installation instructions
  - Added TypeScript and Python quick start examples with concise utterances
  - Included advanced example demonstrating slots and Lambda integration
  - Improved documentation for ConstructHub and npm package visibility
  - Added comprehensive test suites for YesNoBot and AddressChangeBot constructs
  - Configured GitHub Actions CI/CD pipeline for automated publishing

## 1.0.0 (2025-06-03)

- ivan.bliskavka
  - Create a Lex L2 construct to simplify bot deployment with CDK
