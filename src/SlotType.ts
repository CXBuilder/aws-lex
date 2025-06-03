import { CfnBot } from 'aws-cdk-lib/aws-lex';

export interface SlotTypeValue {
  /**
   * If 'resolutionStrategy' is set to 'TOP_RESOLUTION', this will be the resolved slot value if the slot is successfully filled
   */
  readonly sampleValue: string;
  /**
   * a list of phrases that you want the bot to resolve to the sample value
   */
  readonly synonyms?: string[];
}

export interface SlotTypeProps {
  readonly name: string;
  readonly description?: string;
  readonly values: SlotTypeValue[];
  readonly resolutionStrategy?: 'ORIGINAL_VALUE' | 'TOP_RESOLUTION';
}

export class SlotType {
  name: string;
  description?: string;
  values: SlotTypeValue[];
  /**
   * 'ORIGINAL_VALUE' (the default) will resolve to what the caller said, provided it is close to one the provided sample values.
   * 'TOP_RESOLUTION' will always resolve to a sample value, or not at all. Use this if you need to branch on slot values
   */
  resolutionStrategy?: 'ORIGINAL_VALUE' | 'TOP_RESOLUTION';

  constructor(props: SlotTypeProps) {
    this.name = props.name;
    this.description = props.description;
    this.values = props.values;
    this.resolutionStrategy = props.resolutionStrategy;
  }

  public toCdk(): CfnBot.SlotTypeProperty {
    return {
      name: this.name,
      slotTypeValues: this.values.map((v) => ({
        sampleValue: { value: v.sampleValue },
        synonyms: v.synonyms?.map((s) => ({ value: s })),
      })),
      valueSelectionSetting: {
        resolutionStrategy: this.resolutionStrategy ?? 'ORIGINAL_VALUE',
      },
      description: this.description ?? '',
    };
  }
}
