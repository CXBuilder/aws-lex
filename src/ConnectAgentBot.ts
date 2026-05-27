import { Stack } from 'aws-cdk-lib';
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { CfnBot } from 'aws-cdk-lib/aws-lex';
import { Construct } from 'constructs';
import { Bot, Intent, Locale } from '.';

export interface ConnectAgentBotLocale {
  readonly localeId: string;
  readonly voiceId?: string;
  /**
   * @default amazon.nova-2-sonic-v1:0
   */
  readonly speechFoundationModelArn?: string;
}

export interface ConnectAgentBotProps {
  readonly name: string;
  readonly assistantArn: string;
  readonly locales: ConnectAgentBotLocale[];
  readonly connectInstanceArn: string;
}

export class ConnectAgentBot extends Bot {
  constructor(scope: Construct, id: string, props: ConnectAgentBotProps) {
    const { name, assistantArn, locales, connectInstanceArn } = props;

    const qInConnectIntent = new Intent({
      name: 'AmazonQinConnect',
      parentIntentSignature: 'AMAZON.QInConnectIntent',
      qInConnectAssistantArn: assistantArn,
      fulfillmentPrompt: '((x-amz-lex:q-in-connect-response))',
    });

    const endConversation: CfnBot.DialogStateProperty = {
      dialogAction: { type: 'EndConversation' },
    };

    const fallbackIntentInitialResponseSetting: CfnBot.InitialResponseSettingProperty =
      {
        nextStep: { dialogAction: { type: 'InvokeDialogCodeHook' } },
        codeHook: {
          enableCodeHookInvocation: true,
          isActive: true,
          postCodeHookSpecification: {
            successNextStep: endConversation,
            failureNextStep: endConversation,
            timeoutNextStep: endConversation,
          },
        },
      };

    super(scope, id, {
      name,
      connectInstanceArn,
      locales: locales.map(
        ({
          localeId,
          voiceId,
          speechFoundationModelArn = `arn:aws:bedrock:${Stack.of(scope).region}::foundation-model/amazon.nova-2-sonic-v1:0`,
        }) =>
          new Locale({
            localeId,
            speechFoundationModelArn,
            voiceId,
            fallbackIntentInitialResponseSetting,
            intents: [qInConnectIntent],
          }),
      ),
    });

    const { region, account } = Stack.of(this);
    this.role.addToPrincipalPolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ['wisdom:GetAssistant', 'wisdom:CreateSession'],
        resources: [assistantArn, `${assistantArn}/*`],
      }),
    );
    this.role.addToPrincipalPolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ['wisdom:SendMessage', 'wisdom:GetNextMessage'],
        resources: [`arn:aws:wisdom:${region}:${account}:session/*`],
      }),
    );
  }
}
