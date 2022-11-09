import { APIGatewayProxyHandler } from "aws-lambda";
import { document } from "../utils/dynamodbClient";

export const handler:APIGatewayProxyHandler = async (event) => {
  const { userid } = event.pathParameters;

  const response = await document.query({
    TableName: "todos_table",
    IndexName: "todo_index",
    KeyConditionExpression: "user_id = :user_id",
    ExpressionAttributeValues: {
        ":user_id": userid,
    }    
  }).promise();

  return {
    statusCode: 200,
    body: JSON.stringify({todos: response})
  }
}