import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as path from 'path';

export class ServerlessDataPipelineStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create DynamoDB table
    const table = new dynamodb.Table(this, 'PipelineTable', {
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      tableName: 'ServerlessPipelineTable',
      removalPolicy: cdk.RemovalPolicy.DESTROY, // Change this in production!
    });

    // Lambda function that interacts with DynamoDB
    const pipelineLambda = new lambda.Function(this, 'PipelineFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../lambda/operational')),
      environment: {
        TABLE_NAME: table.tableName,
        PRIMARY_KEY: 'id',
      },
    });

    // Grant Lambda permission to interact with DynamoDB
    table.grantReadWriteData(pipelineLambda);

    // Authorizer Lambda function
    const authorizerLambda = new lambda.Function(this, 'AuthorizerFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../lambda/authorizer')),
    });

    // Create API Gateway to trigger the Lambda
    const api = new apigateway.RestApi(this, 'PipelineApi', {
      restApiName: 'Serverless Pipeline Service',
      description: 'This service serves as an API Gateway for the Serverless Pipeline.',
      apiKeySourceType: apigateway.ApiKeySourceType.HEADER, // Ensure API key is required
    });

    // Define a specific resource path /upload
    const uploadResource = api.root.addResource('upload');

    // Create a Lambda Authorizer
    const authorizer = new apigateway.TokenAuthorizer(this, 'PipelineAuthorizer', {
      handler: authorizerLambda,
    });

    // Integrate the Lambda function with this resource and apply the authorizer
    uploadResource.addMethod('POST', new apigateway.LambdaIntegration(pipelineLambda), {
      authorizer: authorizer,
      apiKeyRequired: true, // Require API key for this method
    });

    // Create an API Key
    const apiKey = new apigateway.ApiKey(this, 'ApiKey', {
      apiKeyName: 'MyApiKey',
    });

    // Create a Usage Plan
    const usagePlan = new apigateway.UsagePlan(this, 'UsagePlan', {
      name: 'UsagePlan',
      apiStages: [{
        api: api,
        stage: api.deploymentStage,
      }],
    });

    // Add the API Key to the Usage Plan
    usagePlan.addApiKey(apiKey);

    // Output the API key value
    new cdk.CfnOutput(this, 'ApiKeyValue', {
      value: apiKey.keyId,
      description: 'API Key for accessing the API',
    });
  }
}
