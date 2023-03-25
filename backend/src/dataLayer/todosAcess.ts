import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'

import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'
import createHttpError from 'http-errors'
import { createLogger } from '../utils/logger'

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('TodosAccess')

// TODO: Implement the dataLayer logic

export class TodosAccess {
  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly todosTable = process.env.TODOS_TABLE,
    private readonly todosTableIndexName = process.env.TODOS_USER_ID_INDEX
  ) {}

  async getTodos(userId: string): Promise<TodoItem[]> {
    logger.info(`Getting todos.`, [userId])
    try {
      const result = await this.docClient
        .query({
          TableName: this.todosTable,
          IndexName: this.todosTableIndexName,
          KeyConditionExpression: 'userId = :userId',
          ExpressionAttributeValues: {
            ':userId': userId
          }
        })
        .promise()

      const items = result.Items
      return items as TodoItem[]
    } catch (err) {
      logger.error(`Getting todos failed!`, {
        error: err.message,
        user: userId
      })
      throw err
    }
  }

  async createTodo(todoItem: TodoItem): Promise<TodoItem> {
    logger.info('Creating Todo.', [
      { user: todoItem.userId, todoId: todoItem.todoId }
    ])
    try {
      await this.docClient
        .put({
          TableName: this.todosTable,
          Item: todoItem
        })
        .promise()

      return this.getTodo(todoItem.todoId, todoItem.userId)
    } catch (err) {
      logger.error('Todo creation failed!', {
        error: err.message,
        user: todoItem.userId,
        todoId: todoItem.todoId
      })
    }
  }

  async getTodo(todoId: string, userId: string) {
    let item: { Item: TodoItem }
    try {
      logger.info('Fetching todo item by id', { todoId, userId })
      const params = {
        TableName: this.todosTable,
        Key: { userId, todoId }
      }
      item = (await this.docClient.get(params).promise()) as any as {
        Item: TodoItem
      }
      console.log(item)

      if (!item.Item) {
        logger.error('Fetching todo item by id failed with status code 404', {
          error: 'Not found',
          user: userId,
          todoId
        })
        throw createHttpError(404)
      }

      logger.info('Successfully fetched todo item by id.', { todoId, userId })
      return item.Item
    } catch (err) {
      if (!item) {
        logger.error('Fetching todo item by id failed!', {
          error: err.message,
          user: userId,
          todoId
        })
      }

      throw err
    }
  }

  updateTodoComposer<T>(
    paramsFn: (
      todoId: string,
      userId: string,
      todoUpdate: T
    ) => {
      TableName: string
      Key: { userId: string; todoId: string }
      UpdateExpression: string
      ExpressionAttributeValues: Record<string, any>
      ReturnValues: 'UPDATED_NEW'
    }
  ) {
    return async function (
      todoId: string,
      userId: string,
      todoUpdate: T
    ): Promise<TodoItem> {
      try {
        logger.info('fetching the todo to update', { todoId })
        await this.getTodo(todoId, userId)

        logger.info('Updating todo', { ...todoUpdate, todoId })
        const params = paramsFn(todoId, userId, todoUpdate)
        await this.docClient.update(params).promise()

        logger.info('Successfully updated todo item.', { todoId, userId })
        return this.getTodo(todoId, userId)
      } catch (err) {
        logger.error('Updating todo item failed!', {
          error: err.message,
          user: userId,
          todoId
        })
        throw err
      }
    }
  }

  updateTodo = this.updateTodoComposer<TodoUpdate>(
    (todoId, userId, todoUpdate) => ({
      TableName: this.todosTable,
      Key: { userId, todoId },
      UpdateExpression:
        'set #todoName = :todoName, dueDate = :dueDate, done = :done',
      ExpressionAttributeNames: {
        '#todoName': 'name'
      },
      ExpressionAttributeValues: {
        ':todoName': todoUpdate.name,
        ':dueDate': todoUpdate.dueDate,
        ':done': todoUpdate.done
      },
      ReturnValues: 'UPDATED_NEW'
    })
  )

  updateTodoAttachment = this.updateTodoComposer<{ attachmentUrl: string }>(
    (todoId, userId, todoUpdate) => ({
      TableName: this.todosTable,
      Key: { userId, todoId },
      UpdateExpression: 'set attachmentUrl = :url',
      ExpressionAttributeValues: {
        ':url': todoUpdate.attachmentUrl
      },
      ReturnValues: 'UPDATED_NEW'
    })
  )

  async deleteTodo(todoId: string, userId: string) {
    try {
      const params = {
        TableName: this.todosTable,
        Key: { userId, todoId }
      }

      logger.info('fetching the todo item to delete', { todoId, userId })
      const todoItem = await this.getTodo(todoId, userId)

      logger.info('Deleting todo', {
        todoId,
        user: userId,
        todoOwner: todoItem.userId
      })
      await this.docClient.delete(params).promise()

      logger.info('Delete todo successful', {
        todoId,
        user: userId,
        todoOwner: todoItem.userId
      })
      return todoItem
    } catch (err) {
      logger.error('Deleting todo item failed!', {
        error: err.message,
        user: userId,
        todoId
      })
      throw err
    }
  }
}

function createDynamoDBClient() {
  if (process.env.IS_OFFLINE) {
    console.log('Creating a local DynamoDB instance')

    return new AWS.DynamoDB.DocumentClient({
      region: 'localhost',
      endpoint: 'http://localhost:8000'
    })
  }
  return new AWS.DynamoDB.DocumentClient({
    service: new XAWS.DynamoDB()
  })
}
