import { APIGatewayProxyHandler } from "aws-lambda";
import {document} from "../utils/dynamodbClient"
import { v4 as uuidV4 } from 'uuid';

interface createTodo {
  title: string,
  deadline: Date
}

export const handler: APIGatewayProxyHandler = async (event) => {
  const { title, deadline } = JSON.parse(event.body) as createTodo;
  const { userid } = event.pathParameters;
  const id = uuidV4();

  try{
    await document.put({
      TableName: "todos_table",
      Item: {
        id,
        user_id: userid,
        title,
        done: false,
        deadline: new Date(deadline).toISOString()
      }
    }).promise()

  } catch(err) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: "Erro ao tentar salvar o todo.",
      })
    }
  }

  const response = await document.query({
    TableName: "todos_table",
    KeyConditionExpression: "id = :id",
    ExpressionAttributeValues: {
        ":id": id,
    }
  }).promise();

  const todo = response.Items[0];


  return {
    statusCode: 201,
    body: JSON.stringify({
      message: "Todo criado com sucesso",
      todo: todo,
    })
  }
}