import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'

const XAWS = AWSXRay.captureAWS(AWS)

export class S3Client {
  constructor(
    private readonly client = new XAWS.S3({
      signatureVersion: 'v4'
    }) as AWS.S3,
    private readonly urlExpiration = parseInt(
      process.env.SIGNED_URL_EXPIRATION,
      10
    )
  ) {}

  async deleteObject(Bucket: string, Key: string) {
    return this.client.deleteObject({ Bucket, Key }).promise()
  }

  async getUploadUrl(bucketName: string, key: string) {
    return this.client.getSignedUrl('putObject', {
      Bucket: bucketName,
      Key: key,
      Expires: this.urlExpiration
    })
  }
}
