import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { YesNoBot } from './YesNoBot';

// example test. To run these tests, uncomment this file along with the
// example resource in lib/aws-lex-stack.ts
test('Bot Created', () => {
  const app = new cdk.App();
  // WHEN
  const stack = new cdk.Stack(app, 'MyTestStack');
  new YesNoBot(stack, 'YesNo', {
    name: 'cxbuilder-yes-no',
  });

  // THEN
  const template = Template.fromStack(stack);

  template.hasResourceProperties('AWS::Lex::CfnBot', {
    VisibilityTimeout: 300,
  });
});
