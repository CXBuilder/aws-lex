import { Slot } from './Slot';
import { CfnBot } from 'aws-cdk-lib/aws-lex';

export interface IntentProps {
  readonly name: string;
  readonly utterances: string[];
  readonly slots?: Slot[];
  readonly confirmationPrompt?: string;
  readonly confirmationFailurePrompt?: string;
  readonly fulfillmentPrompt?: string;
  readonly fulfillmentFailurePrompt?: string;
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
   * If provided, lex will speak this when confirmation is declined
   */
  confirmationDeclinedPrompt?: string;

  /**
   * If provided, lex will speak this when the intent is fullfilled
   */
  fulfillmentPrompt?: string;

  /**
   * If provided, lex will speak this when the intent fulfillment fails
   */
  fulfillmentFailurePrompt?: string;

  constructor(props: IntentProps) {
    this.name = props.name;
    this.utterances = props.utterances;
    this.slots = props.slots;
    this.confirmationPrompt = props.confirmationPrompt;
    this.confirmationDeclinedPrompt = props.confirmationFailurePrompt;
    this.fulfillmentPrompt = props.fulfillmentPrompt;
    this.fulfillmentFailurePrompt = props.fulfillmentFailurePrompt;
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
    if (!this.fulfillmentPrompt && !this.fulfillmentFailurePrompt) {
      return undefined;
    }

    const response: any = {};

    if (this.fulfillmentPrompt) {
      response.successResponse = {
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
      };
    }

    if (this.fulfillmentFailurePrompt) {
      response.failureResponse = {
        messageGroupsList: [
          {
            message: {
              plainTextMessage: {
                value: this.fulfillmentFailurePrompt,
              },
            },
          },
        ],
        allowInterrupt: true,
      };
    }

    return response as CfnBot.PostFulfillmentStatusSpecificationProperty;
  }

  private getIntentConfirmationSetting():
    | CfnBot.IntentConfirmationSettingProperty
    | undefined {
    if (!this.confirmationPrompt && !this.confirmationDeclinedPrompt) {
      return undefined;
    }

    const response: any = {};

    if (this.confirmationPrompt) {
      response.promptSpecification = {
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
      };
    }

    if (this.confirmationDeclinedPrompt) {
      response.declinationResponse = {
        messageGroupsList: [
          {
            message: {
              plainTextMessage: {
                value: this.confirmationDeclinedPrompt,
              },
            },
          },
        ],
        allowInterrupt: true,
      };
    }

    return response as CfnBot.IntentConfirmationSettingProperty;
  }
}
