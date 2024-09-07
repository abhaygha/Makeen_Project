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
      handler: 'operational/index.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../lib/lambda')),
      environment: {
        TABLE_NAME: table.tableName,
        PRIMARY_KEY: 'id',
      },
    });

    // Grant Lambda permission to interact with DynamoDB
    table.grantReadWriteData(pipelineLambda);

    //Create API Gateway to trigger the Lambda
    const api = new apigateway.RestApi(this, 'PipelineApi', {
        restApiName: 'Serverless Pipeline Service',
        description: 'This service serves as an API Gateway for the Serverless Pipeline.',
      });
    const uploadResource = api.root.addResource('upload');

      // Integrate the Lambda function with this resource
    uploadResource.addMethod('POST', new apigateway.LambdaIntegration(pipelineLambda));
  
      // Create a POST method on the API Gateway
    const lambdaIntegration = new apigateway.LambdaIntegration(pipelineLambda);
    api.root.addMethod('POST', lambdaIntegration);
  }
}
