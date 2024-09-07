import { Context, APIGatewayEvent } from "aws-lambda";

export async function handler(
    event: APIGatewayEvent,
    context: Context
) {
    console.log("Received event:", JSON.stringify(event, null, 2)); // Log the incoming event

    try {
        // Check if event.body is not null
        if (!event.body) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'Bad Request: No body provided' }),
            };
        }

        // Parse the request body to get fileContent
        const { fileContent } = JSON.parse(event.body);
        console.log("File content received:", fileContent); // Log the received file content

        // Here you can process the file content as needed
        // For now, we will just return a success message

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'File processed successfully!', content: fileContent }),
        };
    } catch (error) {
        console.error("Error processing request:", error); // Log any errors
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Internal Server Error' }),
        };
    }
}