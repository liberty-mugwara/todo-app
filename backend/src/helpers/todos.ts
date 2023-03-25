import * as uuid from 'uuid'

import { deleteAttachment, getUploadUrl } from './attachmentUtils'

import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { TodoItem } from '../models/TodoItem'
import { TodosAccess } from './todosAcess'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import createError from 'http-errors'
import { createLogger } from '../utils/logger'

// TODO: Implement businessLogic
const logger = createLogger('Todos')

const todosAccess = new TodosAccess()

export async function getTodos(userId: string): Promise<TodoItem[]> {
  return todosAccess.getTodos(userId)
}

export async function createTodo(
  createTodoRequest: CreateTodoRequest,
  userId: string
): Promise<TodoItem> {
  try {
    const itemId = uuid.v4()

    return todosAccess.createTodo({
      todoId: itemId,
      userId,
      name: createTodoRequest.name,
      dueDate: createTodoRequest.dueDate,
      createdAt: new Date().toISOString(),
      done: false
    })
  } catch (e) {
    throw createError(500)
  }
}

export async function updateTodo(
  todoId: string,
  userId: string,
  updateTodoRequest: UpdateTodoRequest
): Promise<TodoItem> {
  try {
    return todosAccess.updateTodo(todoId, userId, updateTodoRequest)
  } catch (e) {
    throw createError(500)
  }
}

export async function deleteTodo(
  todoId: string,
  userId: string
): Promise<TodoItem> {
  try {
    const todoItem = await todosAccess.deleteTodo(todoId, userId)
    const attachmentUrl = todoItem.attachmentUrl
    if (attachmentUrl) {
      logger.info('Deleting linked attachment', {
        todoId,
        user: userId,
        todoOwner: todoItem.userId,
        attachmentUrl
      })
      await deleteAttachment(todoId, userId)

      logger.info('Successfully Deleted linked attachment', {
        todoId,
        user: userId,
        todoOwner: todoItem.userId,
        attachmentUrl
      })
    } else {
      logger.info('No linked attachment', {
        todoId,
        user: userId,
        todoOwner: todoItem.userId,
        attachmentUrl
      })
    }
    return todoItem
  } catch (e) {
    throw createError(500)
  }
}

export async function createAttachmentPresignedUrl(
  todoId: string,
  userId: string
) {
  return getUploadUrl(todoId, userId)
}

export async function updateAttachmentUrl(
  todoId: string,
  userId: string,
  url: string
) {
  return todosAccess.updateTodoAttachment(todoId, userId, {
    attachmentUrl: url
  })
}
