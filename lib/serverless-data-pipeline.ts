import { DynamoDBDocument, UpdateCommand, UpdateCommandInput } from '@aws-sdk/lib-dynamodb';
import { DynamoDBClient, ReturnValue } from '@aws-sdk/client-dynamodb'; // Import ReturnValue from here

const TABLE_NAME = process.env.TABLE_NAME || '';
const PRIMARY_KEY = process.env.PRIMARY_KEY || '';

const RESERVED_RESPONSE = `Error: You're using AWS reserved keywords as attributes`,
  DYNAMODB_EXECUTION_ERROR = `Error: Execution update, caused a DynamoDB error, please take a look at your CloudWatch Logs.`;

const db = DynamoDBDocument.from(new DynamoDBClient({}));

export const handler = async (event: any = {}): Promise<any> => {
  if (!event.body) {
    return { statusCode: 400, body: 'Invalid request, you are missing the parameter body' };
  }

  const editedItemId = event.pathParameters?.id;
  if (!editedItemId) {
    return { statusCode: 400, body: 'Invalid request, you are missing the path parameter id' };
  }

  const editedItem: any = typeof event.body === 'object' ? event.body : JSON.parse(event.body);
  const editedItemProperties = Object.keys(editedItem);
  if (editedItemProperties.length < 1) {
    return { statusCode: 400, body: 'Invalid request, no arguments provided' };
  }

  let updateExpression = 'set';
  const expressionAttributeValues: any = {};

  editedItemProperties.forEach((property, index) => {
    if (index > 0) updateExpression += ',';
    updateExpression += ` ${property} = :${property}`;
    expressionAttributeValues[`:${property}`] = editedItem[property];
  });

  const params: UpdateCommandInput = {
    TableName: TABLE_NAME,
    Key: {
      [PRIMARY_KEY]: editedItemId
    },
    UpdateExpression: updateExpression,
    ExpressionAttributeValues: expressionAttributeValues,
    ReturnValues: ReturnValue.UPDATED_NEW // Use the correct enum value here
  };

  try {
    await db.send(new UpdateCommand(params));
    return { statusCode: 204, body: '' };
  } catch (dbError: any) {
    if (dbError instanceof Error) {
      const errorResponse = dbError.name === 'ValidationException' && dbError.message.includes('reserved keyword') ?
        RESERVED_RESPONSE : DYNAMODB_EXECUTION_ERROR;
      return { statusCode: 500, body: errorResponse };
    }
    // Handle unknown error
    return { statusCode: 500, body: DYNAMODB_EXECUTION_ERROR };
  }
};
