# Examples

This library supports Python or NodeJS deployments using the same approach as AWS CDK

## NodeJS Example

```typescript
import { App, Stack } from 'aws-cdk-lib';
import { Bot, Intent, Locale } from '@cxbuilder/aws-lex';

const app = new App();

const stack = new Stack(app, 'Stack');

new Bot(stack, 'YesNoBot', {
  name: 'cxbuilder-yes-no-bot',
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
```

## Python Example

```python
import aws_cdk as cdk
from cxbuilder_aws_lex import Bot, Locale, Intent

app = cdk.App()
stack = cdk.Stack(app, 'Stack')

Bot(
    stack, "YesNoBot",
    name="cxbuilder-yes-no-bot",
    locales=[
        Locale(
            locale_id="en_US",
            voice_id="Joanna",
            intents=[
                Intent(
                    name="Yes",
                    utterances=[
                        "yeah",
                        "yep",
                        "yea",
                        "yes",
                        "all right",
                        "surely",
                        "yes sir",
                        "of course",
                        "absolutely",
                        "for sure",
                        "totally",
                        "correct",
                        "si",
                    ],
                ),
                Intent(
                    name="No",
                    utterances=[
                        "nope",
                        "nah",
                        "no",
                        "never",
                        "no thanks",
                        "no way",
                        "absolutely not",
                        "no thank you",
                        "dont",
                    ],
                ),
            ],
        ),
        Locale(
            locale_id="es_US",
            voice_id="Lupe",
            intents=[
                Intent(
                    name="Yes",
                    utterances=[
                        "sí",
                        "claro",
                        "por supuesto",
                        "afirmativo",
                        "correcto",
                        "exacto",
                        "efectivamente",
                        "cierto",
                        "desde luego",
                        "así es",
                        "seguro",
                        "vale",
                        "bueno",
                        "de acuerdo",
                        "está bien",
                    ],
                ),
                Intent(
                    name="No",
                    utterances=[
                        "no",
                        "para nada",
                        "de ninguna manera",
                        "negativo",
                        "nunca",
                        "jamás",
                        "no gracias",
                        "en absoluto",
                        "de ningún modo",
                        "no quiero",
                        "no me interesa",
                    ],
                ),
            ],
        ),
    ],
)

```
