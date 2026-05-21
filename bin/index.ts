#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { YesNoBot } from '../test/YesNoBot';
import { AddressChangeBot } from '../test/AddressChangeBot';
import { throttleDeploy, ConnectAgentBot } from '../src';

const speechFoundationModelArn =
  'arn:aws:bedrock:us-east-1::foundation-model/amazon.nova-2-sonic-v1:0';

const app = new cdk.App();

const stack = new cdk.Stack(app, 'Stack', {
  stackName: 'cxbuilder-lex-bots',
  env: {
    region: 'us-east-1',
  },
});

throttleDeploy([
  new YesNoBot(stack, 'YesNo', {
    name: 'cxbuilder-yes-no',
  }),
  new AddressChangeBot(stack, 'AddressChange', {
    name: 'cxbuilder-address-change',
  }),
  new ConnectAgentBot(stack, 'ConnectAgent', {
    name: 'cxbuilder-connect-agent',
    connectInstanceArn:
      'arn:aws:connect:us-east-1:779926948221:instance/ee0bc407-15a9-40d4-8eeb-3a90f53e3269',
    assistantArn:
      'arn:aws:wisdom:us-east-1:779926948221:assistant/de86a602-6ac1-4563-a1cb-d4da2524482c',
    locales: [
      {
        localeId: 'en_US',
        voiceId: 'Danielle',
        speechFoundationModelArn,
      },
      {
        localeId: 'es_US',
        voiceId: 'Lupe',
        speechFoundationModelArn,
      },
    ],
  }),
]);
