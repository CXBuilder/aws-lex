import { Aws } from 'aws-cdk-lib';
import { Effect, IRole, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import {
  AwsCustomResource,
  AwsCustomResourcePolicy,
  PhysicalResourceId,
} from 'aws-cdk-lib/custom-resources';
import { UpdateBotLocaleCommandInput } from '@aws-sdk/client-lex-models-v2';
import { Construct } from 'constructs';
import { VoiceEngine } from './Locale';

interface UpdateVoiceEngineProps
  extends Omit<UpdateBotLocaleCommandInput, 'botVersion' | 'voiceSettings'> {
  botId: string;
  localeId: string;
  description?: string;
  nluIntentConfidenceThreshold: number;
  voiceId: string;
  engine: VoiceEngine;
  customResourceRole?: IRole;
}

/**
 * CfnBot does not support engine updates, so making the change via custom resource
 */
export class UpdateVoiceEngine extends AwsCustomResource {
  constructor(scope: Construct, id: string, props: UpdateVoiceEngineProps) {
    const {
      botId,
      localeId,
      description,
      nluIntentConfidenceThreshold,
      voiceId,
      engine,
      customResourceRole,
    } = props;

    const sdkCall = {
      service: 'LexModelsV2',
      action: 'updateBotLocale',
      parameters: {
        botId,
        botVersion: 'DRAFT',
        localeId,
        description,
        nluIntentConfidenceThreshold,
        voiceSettings: {
          voiceId,
          engine,
        },
      } as UpdateBotLocaleCommandInput,
      physicalResourceId: PhysicalResourceId.of(id),
    };

    // Reset engine when custom resource is deleted
    const deleteSdkCall = {
      ...sdkCall,
      parameters: {
        ...sdkCall.parameters,
        voiceSettings: {
          ...sdkCall.parameters.voiceSettings,
          engine: 'standard',
        },
      },
    };

    super(scope, id, {
      installLatestAwsSdk: false,
      onCreate: sdkCall,
      onUpdate: sdkCall,
      onDelete: deleteSdkCall,
      role: customResourceRole,
      policy: customResourceRole
        ? undefined
        : AwsCustomResourcePolicy.fromStatements([
            new PolicyStatement({
              effect: Effect.ALLOW,
              actions: ['lex:UpdateBotLocale'],
              resources: [
                // Granular but occasionally causes race condition between lambda call and policy propagation
                // `arn:aws:lex:${Aws.REGION}:${Aws.ACCOUNT_ID}:bot/${botId}`,
                // Broader permission to avoid race condition
                `arn:aws:lex:${Aws.REGION}:${Aws.ACCOUNT_ID}:bot/*`,
              ],
            }),
          ]),
    });
  }
}
