# Makeen_ProjectAPI and Lambda Integration: An API Gateway to receive POST requests, triggering a Lambda function (TypeScript/JavaScript) for text file uploads.
Data Processing: The Lambda function parses and processes text file contents.
Data Storage: Processed data is stored in Amazon DynamoDB.
Monitoring: Amazon CloudWatch is used for performance monitoring and logging.
Security: IAM and API Gateway policies secure the setup.
Infrastructure as Code: AWS CDK scripts (TypeScript) the infrastructure for easy deployment.

Serverless Data Pipeline
Overview
This project implements a Serverless Data Pipeline using AWS CDK (Cloud Development Kit) with TypeScript. The infrastructure involves an API Gateway, Lambda functions for data processing and authorization, and DynamoDB for data storage. The API is secured using a token-based Lambda authorizer and requires an API key for access.

Architecture
API Gateway: Acts as the entry point for the system, allowing clients to interact with the pipeline.
Lambda Functions:
Pipeline Lambda: Responsible for handling the main data processing, such as uploading data to DynamoDB.
Authorizer Lambda: Performs authorization checks for API Gateway requests.
DynamoDB: A NoSQL database used for storing and retrieving the uploaded data.
API Key & Usage Plan: Secures the API by requiring clients to provide an API key for requests.
Project Structure
python
Copy code
├── bin/
│   └── serverless-data-pipeline.ts       # Entry point for the CDK application
├── lib/
│   ├── serverless-data-pipeline-stack.ts # Main stack defining Lambda, API Gateway, DynamoDB
│   ├── gateway-lambda-auth-stack.ts      # Stack for API Gateway and Lambda authorization
├── lambda/
│   ├── operational/
│   │   └── index.ts                      # Operational Lambda handler code
│   └── authorizer/
│       └── index.ts                      # Authorizer Lambda handler code
├── cdk.json                              # CDK project configuration
├── package.json                          # Node.js dependencies
└── README.md                             # Project documentation
Prerequisites
AWS CLI configured
Node.js installed
AWS CDK installed (npm install -g aws-cdk)
Setup and Deployment
Step 1: Install Dependencies
bash
Copy code
npm install
Step 2: Bootstrap the Environment (If not already bootstrapped)
Run the following command to ensure your AWS account is ready for CDK deployments:

bash
Copy code
cdk bootstrap aws://<account-id>/<region>
Step 3: Deploy the Stack
bash
Copy code
cdk deploy
Step 4: Post-deployment
After deploying the stack, the API Gateway URL and API key will be provided as output. Use these details to interact with the API.

Lambda Functions
Operational Lambda
The Operational Lambda is responsible for processing incoming requests and interacting with DynamoDB.

Path: lambda/operational/index.ts
Function: Receives the file uploaded via POST requests, processes the file, and stores the information in DynamoDB.
Authorizer Lambda
The Authorizer Lambda checks the validity of tokens provided with API requests to ensure that only authenticated users can access the service.

Path: lambda/authorizer/index.ts
Function: Validates the token and returns an authorization decision to the API Gateway.
IAM Roles & Permissions
Pipeline Lambda Role:
AWSLambdaBasicExecutionRole
AWSLambdaDynamoDBExecutionRole (Provides read/write permissions to DynamoDB)
Authorizer Lambda Role:
AWSLambdaBasicExecutionRole
API Gateway
Endpoints
/upload: Allows uploading of data via POST requests.
Method: POST
Authorization: Token-based authorizer via Lambda.
API Key: Required.
Usage Plan & API Key
An API Key and usage plan are created for secure access to the API. After deployment, the API key is provided in the output and needs to be included in the request headers.

Example Header
vbnet
Copy code
x-api-key: <Your API Key>
DynamoDB
Table Name: ServerlessPipelineTable
Partition Key: id (STRING)
Removal Policy: DESTROY (Can be changed for production to retain data)
The DynamoDB table is where the uploaded data is stored. The Lambda function has permissions to perform read and write operations on this table.

API Gateway Security
Token Authorizer: A custom Lambda function serves as a token authorizer to authenticate incoming API requests.
API Key: An API key is required for all requests, ensuring that only authorized users can access the API.
Outputs
After a successful deployment, you’ll see the following outputs:

API Gateway URL: The URL for your API that you can use to make requests.
API Key: The API key that must be provided in the headers of your requests.
Example Request
Here’s an example cURL request to the /upload endpoint, using the API key for authentication:

bash
Copy code
curl -X POST https://<api-id>.execute-api.us-east-1.amazonaws.com/prod/upload \
-H "x-api-key: <Your-API-Key>" \
-d '{"id": "123", "data": "Sample data"}'
Cleanup
To delete the stack and all associated resources, run the following command:

bash
Copy code
cdk destroy
Notes
Logging: CloudWatch logs are enabled for the Lambda functions for debugging and monitoring purposes.
Development: In production, consider changing the removalPolicy of the DynamoDB table to RETAIN to avoid data loss.
