# @cxbuilder/aws-lex

[![CI/CD Pipeline](https://github.com/cxbuilder/aws-lex/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/cxbuilder/aws-lex/actions/workflows/ci-cd.yml)
[![npm version](https://badge.fury.io/js/@cxbuilder%2Faws-lex.svg)](https://badge.fury.io/js/@cxbuilder%2Faws-lex)
[![PyPI version](https://badge.fury.io/py/cxbuilder-aws-lex.svg)](https://badge.fury.io/py/cxbuilder-aws-lex)
[![View on Construct Hub](https://constructs.dev/badge?package=%40cxbuilder%2Faws-lex)](https://constructs.dev/packages/@cxbuilder/aws-lex)

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

## Bot Replication

When Lex replication is enabled, the Lex service automatically replicates the bot configuration to the replica region. However, the following resources are **not** automatically replicated:

- Lambda handler permissions
- Amazon Connect instance associations
- Conversation log group configurations

The `BotReplica` construct handles creating these resources in the replica region.

### Example: Multi-Region Bot Setup

```typescript
import { App, Stack } from 'aws-cdk-lib';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Bot, BotReplica, Intent, Locale } from '@cxbuilder/aws-lex';

const app = new App();

// Primary region (us-east-1)
class EastStack extends Stack {
  public readonly bot: Bot;
  public readonly botHandler: NodejsFunction;

  constructor(scope: App, id: string) {
    super(scope, id, { env: { region: 'us-east-1' } });

    this.botHandler = new NodejsFunction(this, 'BotHandler', {
      entry: './src/bot-handler.ts',
    });

    this.bot = new Bot(this, 'MyBot', {
      name: 'customer-service-bot',
      handler: this.botHandler,
      replicaRegions: ['us-west-2'],
      connectInstanceArn:
        'arn:aws:connect:us-east-1:123456789012:instance/abc123',
      locales: [
        new Locale({
          localeId: 'en_US',
          voiceId: 'Joanna',
          intents: [
            new Intent({
              name: 'GetHelp',
              utterances: ['I need help', 'Can you help me'],
            }),
          ],
        }),
      ],
    });
  }
}

// Replica region (us-west-2)
class WestStack extends Stack {
  public readonly botHandler: NodejsFunction;
  public readonly botReplica: BotReplica;

  constructor(scope: App, id: string, eastStack: EastStack) {
    super(scope, id, { env: { region: 'us-west-2' } });

    this.botHandler = new NodejsFunction(this, 'BotHandler', {
      entry: './src/bot-handler.ts',
    });

    this.botReplica = new BotReplica(this, 'MyBotReplica', {
      botName: eastStack.bot.botName,
      botId: eastStack.bot.botId,
      botAliasId: eastStack.bot.botAliasId,
      handler: this.botHandler,
      connectInstanceArn:
        'arn:aws:connect:us-west-2:123456789012:instance/abc123',
    });
  }
}

const eastStack = new EastStack(app, 'EastStack');
const westStack = new WestStack(app, 'WestStack', eastStack);
```

### BotReplica Properties

- `botName` (required): The name of the bot from the primary region
- `botId` (required): The bot ID from the primary region
- `botAliasId` (required): The bot alias ID from the primary region
- `handler` (optional): Lambda function to use as the bot handler in the replica region
- `connectInstanceArn` (optional): ARN of the Amazon Connect instance to associate with the bot
- `logGroup` (optional): Set to `false` to disable automatic log group creation (default: `true`)

## Utilities

### throttleDeploy

Deploying multiple Lex bots in parallel can hit AWS Lex API limits, causing deployment failures. This function solves that by controlling deployment concurrency through dependency chains, organizing bots into batches where each batch deploys sequentially while different batches can still deploy in parallel.

## License

MIT
