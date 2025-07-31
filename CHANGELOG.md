# Change Log

[Keeping a Changelog](https://keepachangelog.com)

- 1.1.2 - 2025-07-31 ivan.bliskavka

  - Add a custom resource to update voice engine because `CfnBot` only supports `standard`.
    - STATUS: Actually, it looks like CfnBot does update the engine. I see the changes in the UI. I cant really tell the difference between voices though.

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
