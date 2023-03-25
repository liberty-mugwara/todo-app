import { S3Event } from 'aws-lambda'
import { getIdsFromKey } from '../../helpers/attachmentUtils'
import { updateAttachmentUrl } from '../../helpers/todos'

const region = process.env.TODOS_ATTACHMENT_S3_BUCKET_REGION
const bucketName = process.env.ATTACHMENT_S3_BUCKET

export const handler = async (event: S3Event) => {
  const key = decodeURIComponent(
    event.Records[0].s3.object.key.replace(/\+/g, ' ')
  )
  const objectUrl = `https://${bucketName}.s3.${region}.amazonaws.com/${key}`
  const { userId, todoId } = getIdsFromKey(key)
  await updateAttachmentUrl(todoId, userId, objectUrl)
}
