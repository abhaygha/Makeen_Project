#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { ServerlessDataPipelineStack } from '../lib/serverless-data-pipeline-stack';
import { GatewayLambdaAuth } from '../lib/stack/gateway-lambda-auth-stack';

const app = new cdk.App();
new ServerlessDataPipelineStack(app, 'ServerlessDataPipelineStack', {
  env: { account: '891377120087', region: 'us-east-1' }, // Example values
});
new GatewayLambdaAuth(app, 'GatewayLambdaAuthStack', {
  env: { account: '891377120087', region: 'us-east-1' }, // Example values
});
