import { Construct } from 'constructs';
import { Bot, Intent, Locale } from '../src';

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
