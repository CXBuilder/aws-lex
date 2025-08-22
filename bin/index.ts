#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { YesNoBot } from '../test/YesNoBot';
import { AddressChangeBot } from '../test/AddressChangeBot';
import { throttleDeploy } from '../src';

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
]);
