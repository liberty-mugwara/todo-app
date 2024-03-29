import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { cors } from 'middy/middlewares'
import { createTodo } from '../../businessLogic/todos'
import { getUserId } from '../utils'
import middy from 'middy'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
      const newTodo: CreateTodoRequest = JSON.parse(event.body)
      const userId = getUserId(event)
      const item = await createTodo(newTodo, userId)
      return {
        statusCode: 201,
        body: JSON.stringify({ item })
      }
    } catch (e) {
      return e
    }
  }
)

handler.use(
  cors({
    credentials: true
  })
)
