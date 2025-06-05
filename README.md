# @cxbuilder/aws-lex

[![CI/CD Pipeline](https://github.com/cxbuilder/aws-lex/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/cxbuilder/aws-lex/actions/workflows/ci-cd.yml)
[![npm version](https://badge.fury.io/js/@cxbuilder%2Faws-lex.svg)](https://badge.fury.io/js/@cxbuilder%2Faws-lex)
[![PyPI version](https://badge.fury.io/py/cxbuilder-aws-lex.svg)](https://badge.fury.io/py/cxbuilder-aws-lex)

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

## Installation

### Node.js

```bash
npm install @cxbuilder/aws-lex
```

### Python

```bash
pip install cxbuilder-aws-lex
```

## Quick Start

Create a simple yes/no bot with multi-language support:

### TypeScript

```typescript
import { App, Stack } from 'aws-cdk-lib';
import { Bot, Intent, Locale } from '@cxbuilder/aws-lex';

const app = new App();
const stack = new Stack(app, 'MyLexStack');

new Bot(stack, 'YesNoBot', {
  name: 'my-yes-no-bot',
  locales: [
    new Locale({
      localeId: 'en_US',
      voiceId: 'Joanna',
      intents: [
        new Intent({
          name: 'Yes',
          utterances: ['yes', 'yeah', 'yep', 'absolutely', 'of course'],
        }),
        new Intent({
          name: 'No',
          utterances: ['no', 'nope', 'never', 'absolutely not', 'no way'],
        }),
      ],
    }),
    new Locale({
      localeId: 'es_US',
      voiceId: 'Lupe',
      intents: [
        new Intent({
          name: 'Yes',
          utterances: ['sí', 'claro', 'por supuesto', 'correcto', 'exacto'],
        }),
        new Intent({
          name: 'No',
          utterances: ['no', 'para nada', 'negativo', 'jamás', 'en absoluto'],
        }),
      ],
    }),
  ],
});
```

### Python

```python
import aws_cdk as cdk
from cxbuilder_aws_lex import Bot, Locale, Intent

app = cdk.App()
stack = cdk.Stack(app, 'MyLexStack')

Bot(
    stack, "YesNoBot",
    name="my-yes-no-bot",
    locales=[
        Locale(
            locale_id="en_US",
            voice_id="Joanna",
            intents=[
                Intent(
                    name="Yes",
                    utterances=["yes", "yeah", "yep", "absolutely", "of course"],
                ),
                Intent(
                    name="No",
                    utterances=["no", "nope", "never", "absolutely not", "no way"],
                ),
            ],
        ),
        Locale(
            locale_id="es_US",
            voice_id="Lupe",
            intents=[
                Intent(
                    name="Yes",
                    utterances=["sí", "claro", "por supuesto", "correcto", "exacto"],
                ),
                Intent(
                    name="No",
                    utterances=["no", "para nada", "negativo", "jamás", "en absoluto"],
                ),
            ],
        ),
    ],
)
```

## Advanced Example: Bot with Slots and Lambda Integration

```typescript
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Bot, Intent, Locale, Slot } from '@cxbuilder/aws-lex';

const fulfillmentLambda = new NodejsFunction(stack, 'Handler', {
  entry: './src/bot-handler.ts',
});

new Bot(stack, 'BookingBot', {
  name: 'hotel-booking-bot',
  locales: [
    new Locale({
      localeId: 'en_US',
      voiceId: 'Joanna',
      codeHook: {
        fn: fulfillmentLambda,
        fulfillment: true,
      },
      intents: [
        new Intent({
          name: 'BookHotel',
          utterances: [
            'I want to book a room',
            'Book a hotel for {checkInDate}',
            'I need a room in {city}',
          ],
          slots: [
            new Slot({
              name: 'city',
              slotTypeName: 'AMAZON.City',
              elicitationMessages: ['Which city would you like to visit?'],
              required: true,
            }),
            new Slot({
              name: 'checkInDate',
              slotTypeName: 'AMAZON.Date',
              elicitationMessages: ['What date would you like to check in?'],
              required: true,
            }),
          ],
        }),
      ],
    }),
  ],
});
```

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
