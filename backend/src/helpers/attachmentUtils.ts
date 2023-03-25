import { S3Client } from './s3'
import { createLogger } from '../utils/logger'

const logger = createLogger('Attachments')

const bucketName = process.env.ATTACHMENT_S3_BUCKET
const s3 = new S3Client()

export function getUploadUrl(todoId: string, userId: string) {
  logger.info('Getting Upload Url', { todoId, userId, bucketName })
  const uploadUrl = s3.getUploadUrl(bucketName, createObjectKey(todoId, userId))
  logger.info('Successfully Fetched Upload Url', {
    todoId,
    userId,
    bucketName,
    uploadUrl
  })
  return uploadUrl
}

export async function deleteAttachment(todoId: string, userId: string) {
  const key = createObjectKey(todoId, userId)
  logger.info('Deleting Attachment', { todoId, userId, bucketName, key })
  await s3.deleteObject(bucketName, key)
  logger.info('Successfully Deleted Attachment', {
    todoId,
    userId,
    bucketName,
    key
  })
}

export function createObjectKey(todoId: string, userId: string) {
  return `${userId.replace('|', '!')}*${todoId}`
}

export function getIdsFromKey(key: string) {
  const [userId, todoId] = key.replace('!', '|').split('*')
  return { userId, todoId }
}
