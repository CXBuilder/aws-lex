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

Here is a CDK implementation of a simple yes-no bot in English and Spanish

```typescript
import { App, Stack } from 'aws-cdk-lib';

import { Construct } from 'constructs';
import { Bot, Intent, Locale } from '@cxbuilder/aws-lex';

export class YesNoBot extends Bot {
  constructor(scope: Construct, id: string, props: { name: string }) {
    super(scope, id, {
      name: props.name,
      locales: [
        new Locale({
          localeId: 'en_US',
          voiceId: 'Joanna',
          intents: [
            new Intent({
              name: 'Yes',
              utterances: [
                'yeah',
                'yep',
                'yea',
                'yes',
                'all right',
                'surely',
                'yes sir',
                'of course',
                'absolutely',
                'for sure',
                'totally',
                'correct',
                'si',
              ],
            }),
            new Intent({
              name: 'No',
              utterances: [
                'nope',
                'nah',
                'no',
                'never',
                'no thanks',
                'no way',
                'absolutely not',
                'no thank you',
                'dont',
              ],
            }),
          ],
        }),
        new Locale({
          localeId: 'es_US',
          voiceId: 'Lupe',
          intents: [
            new Intent({
              name: 'Yes',
              utterances: [
                'sí',
                'claro',
                'por supuesto',
                'afirmativo',
                'correcto',
                'exacto',
                'efectivamente',
                'cierto',
                'desde luego',
                'así es',
                'seguro',
                'vale',
                'bueno',
                'de acuerdo',
                'está bien',
              ],
            }),
            new Intent({
              name: 'No',
              utterances: [
                'no',
                'para nada',
                'de ninguna manera',
                'negativo',
                'nunca',
                'jamás',
                'no gracias',
                'en absoluto',
                'de ningún modo',
                'no quiero',
                'no me interesa',
              ],
            }),
          ],
        }),
      ],
    });
  }
}

const app = new App();
const stack = new Stack(app, 'LexBotStack');
new YesNoBot(stack, 'YesNo', {
  name: 'cxbuilder-yes-no',
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
