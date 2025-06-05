import { IFunction } from 'aws-cdk-lib/aws-lambda';
import { CfnBot } from 'aws-cdk-lib/aws-lex';
import { ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { Intent } from './Intent';
import { SlotType } from './SlotType';

export declare type VoiceEngine =
  | 'generative'
  | 'long-form'
  | 'neural'
  | 'standard';

export interface LocaleCodeHook {
  /**
   * The lambda function that will be invoked
   */
  readonly fn: IFunction;
  /**
   * Whether to invoke the lambda for each dialog turn
   */
  readonly dialog?: boolean;
  /**
   * Whether to invoke the lambda for each intent fulfillment
   */
  readonly fulfillment?: boolean;
}

export interface LocaleProps {
  readonly localeId: string;
  readonly nluConfidenceThreshold?: number;
  readonly voiceId: string;
  readonly description?: string;
  readonly engine?: VoiceEngine;
  readonly intents?: Intent[];
  readonly slotTypes?: SlotType[];
  readonly codeHook?: LocaleCodeHook;
}

export class Locale {
  localeId: string;

  /**
   * If not provided, will default to bot default value
   */
  nluConfidenceThreshold?: number;

  voiceId: string;

  description?: string;

  /**
   * @default LexDefaults.engine
   */
  engine?: VoiceEngine;

  /**
   * Defines an intent and its associated utterances
   */
  intents?: Intent[] = [];

  /**
   * Any non-standard slot types required
   */
  slotTypes?: SlotType[];

  /**
   * Optional dialog and fulfillment hooks
   */
  codeHook?: LocaleCodeHook;

  constructor(props: LocaleProps) {
    this.localeId = props.localeId;
    this.nluConfidenceThreshold = props.nluConfidenceThreshold;
    this.voiceId = props.voiceId;
    this.description = props.description;
    this.engine = props.engine;
    this.intents = props.intents;
    this.slotTypes = props.slotTypes;
    this.codeHook = props.codeHook;
  }

  public toCdk(botNluConfidenceThreshold: number): CfnBot.BotLocaleProperty {
    const dialogCodeHook = this.codeHook?.dialog ?? false;
    const fulfillmentCodeHook = this.codeHook?.fulfillment ?? false;

    return {
      localeId: this.localeId,
      nluConfidenceThreshold:
        this.nluConfidenceThreshold ?? botNluConfidenceThreshold,
      voiceSettings: {
        voiceId: this.voiceId,
        engine: this.engine ?? 'neural',
      },

      slotTypes: (this.slotTypes ?? []).map((s) => s.toCdk()),
      intents: [
        ...(this.intents ?? []).map((intent) =>
          intent.toCdk(dialogCodeHook, fulfillmentCodeHook)
        ),
        {
          name: 'FallbackIntent',
          dialogCodeHook: { enabled: dialogCodeHook },
          fulfillmentCodeHook: { enabled: fulfillmentCodeHook },
          parentIntentSignature: 'AMAZON.FallbackIntent',
        },
      ],
      description: this.description,
    };
  }

  public addPermission(botAliasArn: string): void {
    this.codeHook?.fn.addPermission(`lex-lambda-invoke-${this.localeId}`, {
      principal: new ServicePrincipal('lexv2.amazonaws.com'),
      action: 'lambda:InvokeFunction',
      sourceArn: botAliasArn,
    });
  }
}
