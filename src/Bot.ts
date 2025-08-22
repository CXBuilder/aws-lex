import { IRole } from 'aws-cdk-lib/aws-iam';
import { CfnBot, CfnBotAlias, CfnBotVersion } from 'aws-cdk-lib/aws-lex';
import { Construct } from 'constructs';
import { LexRole } from './LexRole';
import { hashCode } from './utils/hashCode';
import { Locale } from './Locale';
import { ILogGroup, LogGroup, RetentionDays } from 'aws-cdk-lib/aws-logs';
import { IBucket } from 'aws-cdk-lib/aws-s3';
import { RemovalPolicy } from 'aws-cdk-lib';

export interface BotProps {
  /**
   * A log group will be created by default.
   * Pass in ILogGroup to customize. Disable by passing in false.
   */
  readonly logGroup?: ILogGroup | false;

  /**
   * If provided, bot will record audio
   */
  readonly audioBucket?: IBucket;

  /**
   * Bot name
   */
  readonly name: string;

  /**
   * Bot description
   */
  readonly description?: string;

  readonly locales: Locale[];

  /**
   * Allows you to create a role externally.
   * Use this if all your bots use the same permissions
   */
  readonly role?: IRole;

  /**
   * @default 300
   */
  readonly idleSessionTtlInSeconds?: number;

  /**
   * @default 0.4
   */
  readonly nluConfidenceThreshold?: number;

  readonly replicaRegions?: string[];
}

/**
 * Defines a simplified interface for creating an Amazon Lex Bot.
 */
export class Bot extends Construct {
  readonly role: IRole;
  readonly cfnBot: CfnBot;
  readonly cfnBotVersion: CfnBotVersion;
  readonly cfnBotAlias: CfnBotAlias;

  constructor(scope: Construct, id: string, private readonly props: BotProps) {
    super(scope, id);

    const {
      name,
      description,
      locales,
      idleSessionTtlInSeconds = 300,
      nluConfidenceThreshold = 0.4,
      replicaRegions = [],
    } = props;

    let logGroup: ILogGroup | undefined;
    if (props.logGroup !== false) {
      // Create log group if not provided
      logGroup =
        props.logGroup ??
        new LogGroup(this, 'LogGroup', {
          logGroupName: `/aws/lex/${name}`,
          retention: RetentionDays.SIX_MONTHS,
          removalPolicy: RemovalPolicy.DESTROY,
        });
    }

    this.role =
      props.role ??
      new LexRole(this, 'Role', {
        lexLogGroupName: logGroup?.logGroupName,
      });

    const replication = replicaRegions.length
      ? {
          replicaRegions: replicaRegions,
        }
      : undefined;

    this.cfnBot = new CfnBot(this, 'Bot', {
      name: name,
      description,
      idleSessionTtlInSeconds,
      roleArn: this.role.roleArn,
      dataPrivacy: {
        ChildDirected: false,
      },
      botLocales: locales.map((l) => l.toCdk(nluConfidenceThreshold)),
      // Turned off because locale builds are kicked off when you create a bot version that depends on an unbuilt locale.
      // Source: https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-lex-bot.html#cfn-lex-bot-autobuildbotlocales
      autoBuildBotLocales: false,
      testBotAliasSettings: {
        botAliasLocaleSettings: this.botAliasLocaleSettings(),
        conversationLogSettings: this.conversationLogSettings('TestBotAlias'),
      },
      replication,
    });

    // A new version is created when the hash of the bot props change.
    // Old version is deleted automatically.
    this.cfnBotVersion = new CfnBotVersion(
      this,
      `Version${hashCode(this.props)}`,
      {
        botId: this.cfnBot.attrId,
        botVersionLocaleSpecification: locales.map((l) => ({
          localeId: l.localeId,
          botVersionLocaleDetails: {
            sourceBotVersion: 'DRAFT',
          },
        })),
      }
    );

    // IMPORTANT: Always use a named alias in production. $LATEST alias does not support production workloads
    this.cfnBotAlias = new CfnBotAlias(this, 'Alias', {
      botAliasName: 'live',
      botId: this.cfnBot.attrId,
      botAliasLocaleSettings: this.botAliasLocaleSettings(),
      botVersion: this.cfnBotVersion.attrBotVersion,
      conversationLogSettings: this.conversationLogSettings('live'),
    });

    // Allow bot alias to invoke function(s)
    props.locales.forEach((l) => l.addPermission(this, this.cfnBot.ref));
  }

  private botAliasLocaleSettings(): CfnBotAlias.BotAliasLocaleSettingsItemProperty[] {
    return this.props.locales.map((l) => ({
      botAliasLocaleSetting: {
        enabled: true,
        // Add code hook if lambda is provided
        codeHookSpecification: l.codeHook?.fn && {
          lambdaCodeHook: {
            codeHookInterfaceVersion: '1.0',
            lambdaArn: l.codeHook.fn.functionArn,
          },
        },
      },
      localeId: l.localeId,
    }));
  }

  conversationLogSettings(
    aliasName: string
  ): CfnBotAlias.ConversationLogSettingsProperty | undefined {
    const { logGroup, audioBucket, name } = this.props;
    if (!logGroup && !audioBucket) {
      return;
    }

    return {
      textLogSettings: logGroup
        ? [
            {
              enabled: true,
              destination: {
                cloudWatch: {
                  cloudWatchLogGroupArn: logGroup.logGroupArn,
                  logPrefix: `${name}/${aliasName}`,
                },
              },
            },
          ]
        : undefined,
      audioLogSettings: audioBucket
        ? [
            {
              enabled: true,
              destination: {
                s3Bucket: {
                  s3BucketArn: audioBucket.bucketArn,
                  logPrefix: `${name}/${aliasName}`,
                  // kmsKeyArn: 'todo'
                },
              },
            },
          ]
        : undefined,
    };
  }
}
