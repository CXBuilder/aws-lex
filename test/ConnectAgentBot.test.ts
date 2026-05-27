import * as cdk from 'aws-cdk-lib';
import { Template, Match } from 'aws-cdk-lib/assertions';
import { ConnectAgentBot } from '../src';

const ASSISTANT_ARN =
  'arn:aws:wisdom:us-east-1:123456789012:assistant/de86a602-6ac1-4563-a1cb-d4da2524482c';
const CONNECT_INSTANCE_ARN =
  'arn:aws:connect:us-east-1:123456789012:instance/abc12345-1234-1234-1234-abcdef123456';
const VOICE_ID = 'Matthew';

describe('ConnectAgentBot', () => {
  let app: cdk.App;
  let stack: cdk.Stack;
  let template: Template;

  beforeEach(() => {
    app = new cdk.App();
    stack = new cdk.Stack(app, 'TestStack', {
      env: { region: 'us-east-1', account: '123456789012' },
    });
    new ConnectAgentBot(stack, 'Bot', {
      name: 'test-agent-bot',
      assistantArn: ASSISTANT_ARN,
      connectInstanceArn: CONNECT_INSTANCE_ARN,
      locales: [
        { localeId: 'en_US', voiceId: VOICE_ID },
        { localeId: 'es_US', voiceId: VOICE_ID },
      ],
    });
    template = Template.fromStack(stack);
  });

  test('creates bot with correct name', () => {
    template.hasResourceProperties('AWS::Lex::Bot', {
      Name: 'test-agent-bot',
    });
  });

  test('creates both requested locales', () => {
    template.hasResourceProperties('AWS::Lex::Bot', {
      BotLocales: Match.arrayWith([
        Match.objectLike({ LocaleId: 'en_US' }),
        Match.objectLike({ LocaleId: 'es_US' }),
      ]),
    });
  });

  test('configures Nova Sonic speech model with voiceId on each locale', () => {
    template.hasResourceProperties('AWS::Lex::Bot', {
      BotLocales: Match.arrayWith([
        Match.objectLike({
          LocaleId: 'en_US',
          UnifiedSpeechSettings: {
            SpeechFoundationModel: {
              ModelArn:
                'arn:aws:bedrock:us-east-1::foundation-model/amazon.nova-2-sonic-v1:0',
              VoiceId: VOICE_ID,
            },
          },
        }),
        Match.objectLike({
          LocaleId: 'es_US',
          UnifiedSpeechSettings: {
            SpeechFoundationModel: {
              ModelArn:
                'arn:aws:bedrock:us-east-1::foundation-model/amazon.nova-2-sonic-v1:0',
              VoiceId: VOICE_ID,
            },
          },
        }),
      ]),
    });
  });

  test('configures AmazonQinConnect intent with assistant ARN and response placeholder', () => {
    template.hasResourceProperties('AWS::Lex::Bot', {
      BotLocales: Match.arrayWith([
        Match.objectLike({
          LocaleId: 'en_US',
          Intents: Match.arrayWith([
            Match.objectLike({
              Name: 'AmazonQinConnect',
              ParentIntentSignature: 'AMAZON.QInConnectIntent',
              QInConnectIntentConfiguration: {
                QInConnectAssistantConfiguration: {
                  AssistantArn: ASSISTANT_ARN,
                },
              },
              FulfillmentCodeHook: {
                Enabled: false,
                PostFulfillmentStatusSpecification: {
                  SuccessResponse: Match.objectLike({
                    MessageGroupsList: Match.arrayWith([
                      Match.objectLike({
                        Message: {
                          PlainTextMessage: {
                            Value: '((x-amz-lex:q-in-connect-response))',
                          },
                        },
                      }),
                    ]),
                  }),
                },
              },
            }),
          ]),
        }),
      ]),
    });
  });

  test('configures FallbackIntent with InvokeDialogCodeHook initial response', () => {
    template.hasResourceProperties('AWS::Lex::Bot', {
      BotLocales: Match.arrayWith([
        Match.objectLike({
          LocaleId: 'en_US',
          Intents: Match.arrayWith([
            Match.objectLike({
              Name: 'FallbackIntent',
              ParentIntentSignature: 'AMAZON.FallbackIntent',
              InitialResponseSetting: {
                NextStep: {
                  DialogAction: { Type: 'InvokeDialogCodeHook' },
                },
                CodeHook: {
                  EnableCodeHookInvocation: true,
                  IsActive: true,
                  PostCodeHookSpecification: {
                    SuccessNextStep: {
                      DialogAction: { Type: 'EndConversation' },
                    },
                    FailureNextStep: {
                      DialogAction: { Type: 'EndConversation' },
                    },
                    TimeoutNextStep: {
                      DialogAction: { Type: 'EndConversation' },
                    },
                  },
                },
              },
            }),
          ]),
        }),
      ]),
    });
  });

  test('sets AmazonConnectEnabled bot tag', () => {
    template.hasResourceProperties('AWS::Lex::Bot', {
      BotTags: Match.arrayWith([
        { Key: 'AmazonConnectEnabled', Value: 'True' },
      ]),
    });
  });

  test('grants Wisdom permissions on the bot role', () => {
    template.hasResourceProperties('AWS::IAM::Policy', {
      PolicyDocument: {
        Statement: Match.arrayWith([
          Match.objectLike({
            Effect: 'Allow',
            Action: Match.arrayWith(['wisdom:GetAssistant', 'wisdom:CreateSession']),
            Resource: Match.arrayWith([ASSISTANT_ARN]),
          }),
          Match.objectLike({
            Effect: 'Allow',
            Action: Match.arrayWith(['wisdom:SendMessage', 'wisdom:GetNextMessage']),
            Resource: 'arn:aws:wisdom:us-east-1:123456789012:session/*',
          }),
        ]),
      },
    });
  });

  test('associates bot alias with Connect instance', () => {
    template.hasResourceProperties('AWS::Connect::IntegrationAssociation', {
      InstanceId: CONNECT_INSTANCE_ARN,
      IntegrationType: 'LEX_BOT',
    });
  });

  test('creates bot version and live alias', () => {
    template.hasResourceProperties('AWS::Lex::BotVersion', {
      BotVersionLocaleSpecification: Match.arrayWith([
        { LocaleId: 'en_US', BotVersionLocaleDetails: { SourceBotVersion: 'DRAFT' } },
        { LocaleId: 'es_US', BotVersionLocaleDetails: { SourceBotVersion: 'DRAFT' } },
      ]),
    });
    template.hasResourceProperties('AWS::Lex::BotAlias', {
      BotAliasName: 'live',
    });
  });

  test('creates correct resource counts', () => {
    template.resourceCountIs('AWS::Lex::Bot', 1);
    template.resourceCountIs('AWS::Lex::BotVersion', 1);
    template.resourceCountIs('AWS::Lex::BotAlias', 1);
    template.resourceCountIs('AWS::IAM::Role', 1);
    template.resourceCountIs('AWS::Connect::IntegrationAssociation', 1);
  });

  test('uses custom speechFoundationModelArn when provided', () => {
    const customApp = new cdk.App();
    const customStack = new cdk.Stack(customApp, 'CustomStack', {
      env: { region: 'us-east-1', account: '123456789012' },
    });
    const customArn =
      'arn:aws:bedrock:us-east-1::foundation-model/amazon.nova-pro-v1:0';
    new ConnectAgentBot(customStack, 'Bot', {
      name: 'custom-model-bot',
      assistantArn: ASSISTANT_ARN,
      connectInstanceArn: CONNECT_INSTANCE_ARN,
      locales: [{ localeId: 'en_US', voiceId: VOICE_ID, speechFoundationModelArn: customArn }],
    });
    Template.fromStack(customStack).hasResourceProperties('AWS::Lex::Bot', {
      BotLocales: Match.arrayWith([
        Match.objectLike({
          LocaleId: 'en_US',
          UnifiedSpeechSettings: {
            SpeechFoundationModel: { ModelArn: customArn, VoiceId: VOICE_ID },
          },
        }),
      ]),
    });
  });

  test('matches snapshot', () => {
    expect(template.toJSON()).toMatchSnapshot();
  });
});
