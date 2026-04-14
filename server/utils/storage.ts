import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { nanoid } from 'nanoid'

console.log('PUBLIC_URL:', process.env.STORAGE_PUBLIC_URL)

const client = new S3Client({
  region: 'auto',
  endpoint: process.env.STORAGE_ENDPOINT!,
  credentials: {
    accessKeyId:     process.env.STORAGE_ACCESS_KEY!,
    secretAccessKey: process.env.STORAGE_SECRET_KEY!,
  },
})

const BUCKET     = process.env.STORAGE_BUCKET!
const PUBLIC_URL = process.env.STORAGE_PUBLIC_URL!

export async function uploadFile(
  buffer: Buffer,
  mimeType: string,
  folder = 'media',
) {
  const ext = mimeType.split('/')[1].replace('jpeg', 'jpg')
  const key = `${folder}/${nanoid()}.${ext}`

  await client.send(new PutObjectCommand({
    Bucket:      BUCKET,
    Key:         key,
    Body:        buffer,
    ContentType: mimeType,
  }))

  return `${PUBLIC_URL}/${key}`
}

export async function deleteFile(url: string) {
  const key = url.replace(`${PUBLIC_URL}/`, '')
  await client.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }))
}