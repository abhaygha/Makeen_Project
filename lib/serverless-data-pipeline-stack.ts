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
      handler: 'operational/index.handler', // Ensure the path is correct and matches your Lambda code structure
      code: lambda.Code.fromAsset(path.join(__dirname, '../lambda')),
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
      handler: 'authorizer/index.handler', // Adjust the handler path
      code: lambda.Code.fromAsset(path.join(__dirname, '../lambda')),
    });

    // Create API Gateway to trigger the Lambda
    const api = new apigateway.RestApi(this, 'PipelineApi', {
      restApiName: 'Serverless Pipeline Service',
      description: 'This service serves as an API Gateway for the Serverless Pipeline.',
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
    });
  }
}
