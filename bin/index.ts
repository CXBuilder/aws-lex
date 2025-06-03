#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { YesNoBot } from '../test/YesNoBot';

const app = new cdk.App();

const stack = new cdk.Stack(app, 'Stack', {
  stackName: 'cxbuilder-lex-bot',
  env: {
    region: 'us-east-1',
  },
});

new YesNoBot(stack, 'YesNo', {
  name: 'cxbuilder-yes-no',
});
