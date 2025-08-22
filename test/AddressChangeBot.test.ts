import * as cdk from 'aws-cdk-lib';
import { Template, Match } from 'aws-cdk-lib/assertions';
import { AddressChangeBot } from './AddressChangeBot';

describe('AddressChangeBot', () => {
  let app: cdk.App;
  let stack: cdk.Stack;
  let template: Template;

  beforeEach(() => {
    app = new cdk.App();
    stack = new cdk.Stack(app, 'TestStack');
    new AddressChangeBot(stack, 'AddressChange', {
      name: 'test-address-change-bot',
    });
    template = Template.fromStack(stack);
  });

  test('creates a Lex bot with correct name', () => {
    template.hasResourceProperties('AWS::Lex::Bot', {
      Name: 'test-address-change-bot',
    });
  });

  test('creates a Lambda function for fulfillment', () => {
    template.hasResourceProperties('AWS::Lambda::Function', {
      Handler: 'index.handler',
    });
  });

  test('creates IAM role for Lambda execution', () => {
    template.hasResourceProperties('AWS::IAM::Role', {
      AssumeRolePolicyDocument: {
        Statement: [
          {
            Action: 'sts:AssumeRole',
            Effect: 'Allow',
            Principal: {
              Service: 'lambda.amazonaws.com',
            },
          },
        ],
      },
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

  test('creates AddressChange intent with required slots', () => {
    template.hasResourceProperties('AWS::Lex::Bot', {
      BotLocales: Match.arrayWith([
        Match.objectLike({
          LocaleId: 'en_US',
          Intents: Match.arrayWith([
            Match.objectLike({
              Name: 'AddressChange',
              SampleUtterances: Match.arrayWith([
                { Utterance: 'Update address' },
                { Utterance: 'Change address' },
                { Utterance: 'Address change' },
              ]),
            }),
          ]),
        }),
      ]),
    });
  });

  test('creates Agent intent for human escalation', () => {
    template.hasResourceProperties('AWS::Lex::Bot', {
      BotLocales: Match.arrayWith([
        Match.objectLike({
          LocaleId: 'en_US',
          Intents: Match.arrayWith([
            Match.objectLike({
              Name: 'Agent',
              SampleUtterances: Match.arrayWith([
                { Utterance: 'Speak to an agent' },
                { Utterance: 'Talk to a human' },
                { Utterance: 'I need human help' },
              ]),
            }),
          ]),
        }),
      ]),
    });
  });

  test('configures bot with English locale and Joanna voice', () => {
    template.hasResourceProperties('AWS::Lex::Bot', {
      BotLocales: Match.arrayWith([
        Match.objectLike({
          LocaleId: 'en_US',
          VoiceSettings: {
            Engine: 'neural',
            VoiceId: 'Joanna',
          },
        }),
      ]),
    });
  });

  test('creates Lambda permission for Lex to invoke function', () => {
    template.hasResourceProperties('AWS::Lambda::Permission', {
      Action: 'lambda:InvokeFunction',
      Principal: 'lexv2.amazonaws.com',
    });
  });

  test('creates bot version and alias', () => {
    template.hasResourceProperties('AWS::Lex::BotVersion', {
      BotVersionLocaleSpecification: [
        {
          LocaleId: 'en_US',
          BotVersionLocaleDetails: {
            SourceBotVersion: 'DRAFT',
          },
        },
      ],
    });

    template.hasResourceProperties('AWS::Lex::BotAlias', {
      BotAliasName: 'live',
    });
  });

  test('creates correct resource counts', () => {
    template.resourceCountIs('AWS::Lex::Bot', 1);
    template.resourceCountIs('AWS::Lex::BotVersion', 1);
    template.resourceCountIs('AWS::Lex::BotAlias', 1);
    template.resourceCountIs('AWS::Lambda::Function', 1);
    template.resourceCountIs('AWS::Lambda::Permission', 1);
    // 2 IAM roles: one for Lambda, one for Lex
    template.resourceCountIs('AWS::IAM::Role', 2);
  });

  test('matches snapshot', () => {
    expect(template.toJSON()).toMatchSnapshot();
  });
});
