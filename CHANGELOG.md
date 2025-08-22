# Change Log

[Keeping a Changelog](https://keepachangelog.com)

- 1.2.0 - 2025-08-22 ivan.bliskavka

  - Create a bot log group by default. Pass `false` to disable.
  - Add `throttleDeploy` function to handle Lex API throttling issues when deploying multiple bots.

- 1.1.1 - 2025-07-28 ivan.bliskavka

  - Expose `replicaRegions` props for Global Resiliency

- 1.1.0 - 2025-07-10 ivan.bliskavka

  - Added Intent `confirmationFailurePrompt` and `fulfillmentFailurePrompt`
  - Automatically allow all aliases to call the codehook lambda

- 1.0.2 - 2025-06-06 ivan.bliskavka

  - Python example in readme is redundant. ConstructHub automatically makes the conversion

- 1.0.1 - 2025-06-06 ivan.bliskavka

  - Enhanced README with comprehensive examples and installation instructions
  - Added TypeScript and Python quick start examples with concise utterances
  - Included advanced example demonstrating slots and Lambda integration
  - Improved documentation for ConstructHub and npm package visibility
  - Added comprehensive test suites for YesNoBot and AddressChangeBot constructs
  - Configured GitHub Actions CI/CD pipeline for automated publishing

- 1.0.0 - 2025-06-03 ivan.bliskavka

  - Create a Lex L2 construct to simplify bot deployment with CDK
