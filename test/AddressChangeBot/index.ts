import { Construct } from 'constructs';
import { resolve } from 'path';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Bot, Intent, Locale, Slot } from '../../src';

/**
 * Fills address change slots and calls a fulfillment lambda
 * ALERT: This is more of beta/starter. You may need a custom slot type for the street.
 * Sample created from: https://aws.amazon.com/blogs/contact-center/updating-your-addresses-with-amazon-connect-and-amazon-lex/
 */
export class AddressChangeBot extends Construct {
  readonly lambda: NodejsFunction;
  readonly bot: Bot;

  constructor(scope: Construct, id: string, props: { name: string }) {
    super(scope, id);

    this.lambda = new NodejsFunction(this, 'Lambda', {
      entry: resolve(__dirname, 'handler.ts'),
    });

    this.bot = new Bot(this, 'Bot', {
      name: props.name,
      locales: [
        new Locale({
          localeId: 'en_US',
          voiceId: 'Joanna',
          codeHook: {
            fn: this.lambda,
            fulfillment: true,
          },
          intents: [
            new Intent({
              name: 'AddressChange',
              utterances: [
                'I would like to update my address to {houseNumber} {streetName}',
                'I would like to update my address to {houseNumber} {streetName} {city} {state} {zipCode}',
                'I would like to update to my new address',
                'I would like to update address',
                'Update address',
                'I want to change my address',
                'Change address',
                'Address change',
              ],
              slots: [
                new Slot({
                  name: 'houseNumber',
                  slotTypeName: 'AMAZON.Number',
                  elicitationMessages: ['What is the house or building?'],
                  required: true,
                }),
                new Slot({
                  name: 'streetName',
                  // slotTypeName: 'AMAZON.StreetName',               // Not available in en_US !?!?!
                  slotTypeName: 'AMAZON.AlphaNumeric',
                  elicitationMessages: ['What is the street name?'],
                  required: true,
                }),
                new Slot({
                  name: 'city',
                  slotTypeName: 'AMAZON.City',
                  elicitationMessages: ['What is the city?'],
                  required: true,
                }),
                new Slot({
                  name: 'state',
                  slotTypeName: 'AMAZON.State',
                  elicitationMessages: ['What is the state?'],
                  required: true,
                }),
                new Slot({
                  name: 'zipCode',
                  slotTypeName: 'AMAZON.Number',
                  elicitationMessages: ['What is the zip code?'],
                  required: true,
                }),
              ],
            }),
            new Intent({
              name: 'Agent',
              utterances: [
                'Speak to an agent',
                'Talk to a human',
                'I need human help',
              ],
            }),
          ],
        }),
      ],
    });
  }
}
