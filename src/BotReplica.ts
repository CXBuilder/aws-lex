import { RemovalPolicy, Stack } from 'aws-cdk-lib';
import { CfnIntegrationAssociation } from 'aws-cdk-lib/aws-connect';
import { ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { IFunction } from 'aws-cdk-lib/aws-lambda';
import { LogGroup, RetentionDays } from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';

export interface BotReplicaProps {
  readonly botName: string;
  readonly botId: string;
  readonly botAliasId: string;

  /**
   * A /aws/lex/{botName} log group will be created by default. Set to false to disable
   * @default true
   */
  readonly logGroup?: boolean;

  /**
   * If provided, allows Lex service handler function in the replica region.
   */
  readonly handler?: IFunction;

  /**
   * If provided, associates the bot with the Amazon Connect instance.
   */
  readonly connectInstanceArn?: string;
}

/**
 * Configures resources which are not automatically replicated by Lex in replica regions.
 */
export class BotReplica extends Construct {
  constructor(scope: Construct, id: string, props: BotReplicaProps) {
    super(scope, id);
    const { region, account } = Stack.of(scope);
    if (props.logGroup !== false && !props.logGroup) {
      // Create log group if not provided
      new LogGroup(scope, `${id}LogGroup`, {
        logGroupName: `/aws/lex/${props.botName}`,
        retention: RetentionDays.SIX_MONTHS,
        removalPolicy: RemovalPolicy.DESTROY,
      });
    }
    if (props.handler) {
      props.handler.addPermission(`lex-lambda-invoke-${id}`, {
        principal: new ServicePrincipal('lexv2.amazonaws.com'),
        action: 'lambda:InvokeFunction',
        sourceArn: `arn:aws:lex:${region}:${account}:bot-alias/${props.botId}/*`,
      });
    }
    if (props.connectInstanceArn) {
      new CfnIntegrationAssociation(scope, `${id}ConnectIntegration`, {
        instanceId: props.connectInstanceArn,
        integrationArn: `arn:aws:lex:${region}:${account}:bot-alias/${props.botId}/${props.botAliasId}`,
        integrationType: 'LEX_BOT',
      });
    }
  }
}
