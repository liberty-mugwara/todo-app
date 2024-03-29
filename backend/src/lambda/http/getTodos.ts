import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import { cors } from 'middy/middlewares'
import { getTodos } from '../../businessLogic/todos'
import { getUserId } from '../utils'
import middy from 'middy'

// TODO: Get all TODO items for a current user
export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    // Write your code here
    const userId = getUserId(event)
    const items = await getTodos(userId)

    return {
      statusCode: 200,
      body: JSON.stringify({ items })
    }
  }
)
handler.use(
  cors({
    credentials: true
  })
)
