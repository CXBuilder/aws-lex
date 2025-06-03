import { CfnBot } from 'aws-cdk-lib/aws-lex';

export interface SlotProps {
  readonly name: string;
  readonly slotTypeName: string;
  readonly description?: string;
  readonly elicitationMessages: string[];
  readonly allowInterrupt?: boolean;
  readonly maxRetries?: number;
  readonly required?: boolean;
}

export class Slot {
  name: string;

  /**
   * @todo is there a way to restrict to possible values?
   */
  slotTypeName: string;

  description?: string;

  elicitationMessages: string[];

  /**
   * @default true
   */
  allowInterrupt?: boolean;

  /**
   * @default 3
   */
  maxRetries?: number;

  required?: boolean;

  constructor(props: SlotProps) {
    this.name = props.name;
    this.slotTypeName = props.slotTypeName;
    this.description = props.description;
    this.elicitationMessages = props.elicitationMessages;
    this.allowInterrupt = props.allowInterrupt;
    this.maxRetries = props.maxRetries;
    this.required = props.required;
  }

  public toCdk(): CfnBot.SlotProperty {
    return {
      name: this.name,
      slotTypeName: this.slotTypeName,
      description: this.description,
      valueElicitationSetting: {
        slotConstraint: this.required ? 'Required' : 'Optional',
        promptSpecification: {
          allowInterrupt: this.allowInterrupt ?? true,
          maxRetries: this.maxRetries ?? 3,
          messageGroupsList: this.elicitationMessages.map((message) => ({
            message: {
              plainTextMessage: {
                value: message,
              },
            },
          })),
        },
      },
    };
  }
}
