import { Stack } from 'aws-cdk-lib';
import {
  Effect,
  Policy,
  PolicyStatement,
  Role,
  ServicePrincipal,
} from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export interface LexRoleProps {
  readonly roleName?: string;

  /**
   * Limits permission to write to a single log group
   */
  readonly lexLogGroupName?: string;
}
/**
 * Standard lex role configuration
 */
export class LexRole extends Role {
  constructor(scope: Construct, id: string, props?: LexRoleProps) {
    super(scope, id, {
      ...props,
      assumedBy: new ServicePrincipal('lexv2.amazonaws.com'),
    });

    const { account, region } = Stack.of(this);

    const { lexLogGroupName = '*' } = props ?? {};

    this.attachInlinePolicy(
      new Policy(this, 'LexPolicy', {
        statements: [
          new PolicyStatement({
            effect: Effect.ALLOW,
            actions: ['polly:SynthesizeSpeech'],
            resources: ['*'],
          }),
          new PolicyStatement({
            effect: Effect.ALLOW,
            actions: ['logs:CreateLogStream', 'logs:PutLogEvents'],
            resources: [
              `arn:aws:logs:${region}:${account}:log-group:${lexLogGroupName}:log-stream:*`,
            ],
          }),
          // Uncomment this if using Sentiment Analysis
          // new PolicyStatement({
          //   effect: Effect.ALLOW,
          //   actions: ['comprehend:DetectSentiment'],
          //   resources: ['*']
          // })
        ],
      })
    );
  }
}
