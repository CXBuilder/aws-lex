# @cxbuilder/aws-lex

## Overview

The `@cxbuilder/aws-lex` package provides higher-level (L2) constructs for AWS LexV2 bot creation using the AWS CDK. It significantly simplifies the process of building conversational interfaces with Amazon Lex by abstracting away the complexity of the AWS LexV2 L1 constructs.

## Why Use This Library?

AWS LexV2 L1 constructs are notoriously difficult to understand and use correctly. They require deep knowledge of the underlying CloudFormation resources and complex property structures. This library addresses these challenges by:

- **Simplifying the API**: Providing an intuitive, object-oriented interface for defining bots, intents, slots, and locales
- **Automating best practices**: Handling versioning and alias management automatically
- **Reducing boilerplate**: Eliminating repetitive code for common bot configurations
- **Improving maintainability**: Using classes with encapsulated transformation logic instead of complex nested objects

## Key Features

- **Automatic versioning**: Creates a bot version and associates it with the `live` alias when input changes
- **Simplified intent creation**: Define intents with utterances and slots using a clean, declarative syntax
- **Multi-locale support**: Easily create bots that support multiple languages
- **Lambda integration**: Streamlined setup for dialog and fulfillment Lambda hooks
- **Extensible design**: For complex use cases, you can always drop down to L1 constructs or fork the repository

## Getting Started

Please review the [examples](./docs/examples.md) for a CDK implementation of a simple yes-no bot in English and Spanish

## Architecture

The library uses a class-based approach with the following main components:

- **Bot**: The main construct that creates the Lex bot resource
- **Locale**: Configures language-specific settings and resources
- **Intent**: Defines conversational intents with utterances and slots
- **Slot**: Defines input parameters for intents
- **SlotType**: Defines custom slot types with enumeration values

## Advanced Usage

While this library simplifies common use cases, you can still leverage the full power of AWS LexV2 for complex scenarios:

- **Rich responses**: For bots that use cards and complex response types
- **Custom dialog management**: For sophisticated conversation flows
- **Advanced slot validation**: For complex input validation requirements

In these cases, you can either extend the library classes or drop down to the L1 constructs as needed.

## License

MIT
