import * as cdk from 'aws-cdk-lib';
import { Template, Match } from 'aws-cdk-lib/assertions';
import { YesNoBot } from './YesNoBot';

describe('YesNoBot', () => {
  let app: cdk.App;
  let stack: cdk.Stack;
  let template: Template;

  beforeEach(() => {
    app = new cdk.App();
    stack = new cdk.Stack(app, 'MyTestStack');
    new YesNoBot(stack, 'YesNo', {
      name: 'cxbuilder-yes-no',
    });
    template = Template.fromStack(stack);
  });

  test('creates a Lex bot with correct name', () => {
    template.hasResourceProperties('AWS::Lex::Bot', {
      Name: 'cxbuilder-yes-no',
    });
  });

  test('creates IAM role for Lex service', () => {
    template.hasResourceProperties('AWS::IAM::Role', {
      AssumeRolePolicyDocument: {
        Statement: [
          {
            Action: 'sts:AssumeRole',
            Effect: 'Allow',
            Principal: {
              Service: 'lexv2.amazonaws.com',
            },
          },
        ],
      },
    });
  });

  test('creates IAM policy with Polly and CloudWatch permissions', () => {
    template.hasResourceProperties('AWS::IAM::Policy', {
      PolicyDocument: {
        Statement: [
          {
            Action: 'polly:SynthesizeSpeech',
            Effect: 'Allow',
            Resource: '*',
          },
          {
            Action: ['logs:CreateLogStream', 'logs:PutLogEvents'],
            Effect: 'Allow',
          },
        ],
      },
    });
  });

  test('creates bot with two locales', () => {
    template.hasResourceProperties('AWS::Lex::Bot', {
      BotLocales: [
        {
          LocaleId: 'en_US',
          VoiceSettings: {
            Engine: 'neural',
            VoiceId: 'Joanna',
          },
        },
        {
          LocaleId: 'es_US',
          VoiceSettings: {
            Engine: 'neural',
            VoiceId: 'Lupe',
          },
        },
      ],
    });
  });

  test('creates Yes and No intents for each locale', () => {
    template.hasResourceProperties('AWS::Lex::Bot', {
      BotLocales: Match.arrayWith([
        Match.objectLike({
          LocaleId: 'en_US',
          Intents: Match.arrayWith([
            Match.objectLike({
              Name: 'Yes',
            }),
            Match.objectLike({
              Name: 'No',
            }),
          ]),
        }),
      ]),
    });
  });

  test('creates bot version', () => {
    template.hasResourceProperties('AWS::Lex::BotVersion', {
      BotVersionLocaleSpecification: [
        {
          LocaleId: 'en_US',
          BotVersionLocaleDetails: {
            SourceBotVersion: 'DRAFT',
          },
        },
        {
          LocaleId: 'es_US',
          BotVersionLocaleDetails: {
            SourceBotVersion: 'DRAFT',
          },
        },
      ],
    });
  });

  test('creates bot alias', () => {
    template.hasResourceProperties('AWS::Lex::BotAlias', {
      BotAliasName: 'live',
      BotAliasLocaleSettings: [
        {
          LocaleId: 'en_US',
          BotAliasLocaleSetting: {
            Enabled: true,
          },
        },
        {
          LocaleId: 'es_US',
          BotAliasLocaleSetting: {
            Enabled: true,
          },
        },
      ],
    });
  });

  test('creates exactly 4 main resources', () => {
    template.resourceCountIs('AWS::Lex::Bot', 1);
    template.resourceCountIs('AWS::Lex::BotVersion', 1);
    template.resourceCountIs('AWS::Lex::BotAlias', 1);
    template.resourceCountIs('AWS::IAM::Role', 1);
    template.resourceCountIs('AWS::IAM::Policy', 1);
  });

  test('matches snapshot', () => {
    expect(template.toJSON()).toMatchSnapshot();
  });
});
