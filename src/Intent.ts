import { Slot } from './Slot';
import { CfnBot } from 'aws-cdk-lib/aws-lex';

export interface IntentProps {
  readonly name: string;
  readonly utterances: string[];
  readonly slots?: Slot[];
  readonly confirmationPrompt?: string;
  readonly fulfillmentPrompt?: string;
}

export class Intent {
  name: string;
  utterances: string[];
  /**
   * Slots in priority order
   */
  slots?: Slot[];

  /**
   * If provided, lex will confirm the intent
   */
  confirmationPrompt?: string;

  /**
   * If provided, lex will speak this when the intent is fullfilled
   */
  fulfillmentPrompt?: string;

  constructor(props: IntentProps) {
    this.name = props.name;
    this.utterances = props.utterances;
    this.slots = props.slots;
    this.confirmationPrompt = props.confirmationPrompt;
    this.fulfillmentPrompt = props.fulfillmentPrompt;
  }

  public toCdk(
    dialogCodeHook: boolean,
    fulfillmentCodeHook: boolean
  ): CfnBot.IntentProperty {
    return {
      name: this.name,
      dialogCodeHook: { enabled: dialogCodeHook },
      fulfillmentCodeHook: {
        enabled: fulfillmentCodeHook,
        postFulfillmentStatusSpecification: this.getPostFulfillmentPrompt(),
      },
      sampleUtterances: this.utterances.map((u) => ({
        utterance: u,
      })),
      slotPriorities: this.slots?.map((slot, index) => ({
        slotName: slot.name,
        priority: index + 1,
      })),
      slots: this.slots?.map((slot) => slot.toCdk()),
      intentConfirmationSetting: this.getIntentConfirmationSetting(),
    };
  }

  private getPostFulfillmentPrompt():
    | CfnBot.PostFulfillmentStatusSpecificationProperty
    | undefined {
    if (!this.fulfillmentPrompt) {
      return undefined;
    }

    return {
      successResponse: {
        messageGroupsList: [
          {
            message: {
              plainTextMessage: {
                value: this.fulfillmentPrompt,
              },
            },
          },
        ],
        allowInterrupt: true,
      },
      failureResponse: {
        messageGroupsList: [
          {
            message: {
              plainTextMessage: {
                value: 'Sorry, I was unable to fulfill your request.',
              },
            },
          },
        ],
        allowInterrupt: true,
      },
    };
  }

  private getIntentConfirmationSetting():
    | CfnBot.IntentConfirmationSettingProperty
    | undefined {
    if (!this.confirmationPrompt) {
      return undefined;
    }

    return {
      promptSpecification: {
        messageGroupsList: [
          {
            message: {
              plainTextMessage: {
                value: this.confirmationPrompt,
              },
            },
          },
        ],
        maxRetries: 3,
        allowInterrupt: true,
      },
      declinationResponse: {
        messageGroupsList: [
          {
            message: {
              plainTextMessage: {
                value: 'OK, I will not proceed.',
              },
            },
          },
        ],
        allowInterrupt: true,
      },
    };
  }
}
