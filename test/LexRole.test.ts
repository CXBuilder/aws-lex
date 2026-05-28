import * as cdk from 'aws-cdk-lib';
import { Template, Match } from 'aws-cdk-lib/assertions';
import { LexRole } from '../src/LexRole';
import { Bot, Intent, Locale } from '../src';

const env = { account: '123456789012', region: 'us-east-1' };

const makeStack = () => new cdk.Stack(new cdk.App(), 'TestStack', { env });

// CDK serializes a single-element resource list as a plain string, not an array.
const logStatement = (resources: string | string[]) => ({
  Action: ['logs:CreateLogStream', 'logs:PutLogEvents'],
  Effect: 'Allow',
  Resource: resources,
});

describe('LexRole log group permissions', () => {
  test('without replicaRegions, policy covers only the primary region', () => {
    const stack = makeStack();
    new LexRole(stack, 'Role', { lexLogGroupName: '/aws/lex/MyBot' });
    Template.fromStack(stack).hasResourceProperties('AWS::IAM::Policy', {
      PolicyDocument: {
        Statement: Match.arrayWith([
          logStatement('arn:aws:logs:us-east-1:123456789012:log-group:/aws/lex/MyBot:log-stream:*'),
        ]),
      },
    });
  });

  test('with a single replicaRegion, policy covers primary and replica region', () => {
    const stack = makeStack();
    new LexRole(stack, 'Role', {
      lexLogGroupName: '/aws/lex/MyBot',
      replicaRegions: ['us-west-2'],
    });
    Template.fromStack(stack).hasResourceProperties('AWS::IAM::Policy', {
      PolicyDocument: {
        Statement: Match.arrayWith([
          logStatement([
            'arn:aws:logs:us-east-1:123456789012:log-group:/aws/lex/MyBot:log-stream:*',
            'arn:aws:logs:us-west-2:123456789012:log-group:/aws/lex/MyBot:log-stream:*',
          ]),
        ]),
      },
    });
  });

  test('with multiple replicaRegions, policy covers all regions', () => {
    const stack = makeStack();
    new LexRole(stack, 'Role', {
      lexLogGroupName: '/aws/lex/MyBot',
      replicaRegions: ['us-west-2', 'eu-west-1'],
    });
    Template.fromStack(stack).hasResourceProperties('AWS::IAM::Policy', {
      PolicyDocument: {
        Statement: Match.arrayWith([
          logStatement([
            'arn:aws:logs:us-east-1:123456789012:log-group:/aws/lex/MyBot:log-stream:*',
            'arn:aws:logs:us-west-2:123456789012:log-group:/aws/lex/MyBot:log-stream:*',
            'arn:aws:logs:eu-west-1:123456789012:log-group:/aws/lex/MyBot:log-stream:*',
          ]),
        ]),
      },
    });
  });
});

describe('Bot passes replicaRegions through to the role policy', () => {
  const locales = [
    new Locale({
      localeId: 'en_US',
      voiceId: 'Joanna',
      intents: [new Intent({ name: 'Yes', utterances: ['yes'] })],
    }),
  ];

  // The Bot construct passes logGroup.logGroupName (a CDK token) into LexRole,
  // so the synthesized ARN uses Fn::Join rather than a plain string. Instead of
  // matching exact ARN values, we check the number of Resource entries and that
  // each replica region string appears in the correct position.
  const getLogsStatement = (template: Template) => {
    const policies = template.findResources('AWS::IAM::Policy');
    const statements: any[] =
      Object.values(policies)[0].Properties.PolicyDocument.Statement;
    return statements.find((s) =>
      Array.isArray(s.Action)
        ? s.Action.includes('logs:CreateLogStream')
        : s.Action === 'logs:CreateLogStream'
    );
  };

  test('policy has one resource entry when no replicaRegions', () => {
    const stack = makeStack();
    new Bot(stack, 'Bot', { name: 'MyBot', locales });
    const stmt = getLogsStatement(Template.fromStack(stack));
    // Single resource is serialized as a scalar (string or Fn::Join), not an array.
    expect(Array.isArray(stmt.Resource)).toBe(false);
  });

  test('policy has two resource entries when one replicaRegion is given', () => {
    const stack = makeStack();
    new Bot(stack, 'Bot', { name: 'MyBot', locales, replicaRegions: ['eu-west-1'] });
    const stmt = getLogsStatement(Template.fromStack(stack));
    expect(stmt.Resource).toHaveLength(2);
    expect(JSON.stringify(stmt.Resource[1])).toContain('eu-west-1');
  });

  test('policy has three resource entries when two replicaRegions are given', () => {
    const stack = makeStack();
    new Bot(stack, 'Bot', {
      name: 'MyBot',
      locales,
      replicaRegions: ['us-west-2', 'eu-west-1'],
    });
    const stmt = getLogsStatement(Template.fromStack(stack));
    expect(stmt.Resource).toHaveLength(3);
    expect(JSON.stringify(stmt.Resource[1])).toContain('us-west-2');
    expect(JSON.stringify(stmt.Resource[2])).toContain('eu-west-1');
  });
});
