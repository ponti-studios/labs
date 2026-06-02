import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

type StorageEnv = {
  s3Endpoint: string;
  s3Region: string;
  s3Bucket: string;
  s3AccessKeyId: string;
  s3SecretAccessKey: string;
  s3PublicUrl: string;
};

function createS3Client(env: StorageEnv) {
  return new S3Client({
    endpoint: env.s3Endpoint,
    region: env.s3Region,
    credentials: {
      accessKeyId: env.s3AccessKeyId,
      secretAccessKey: env.s3SecretAccessKey,
    },
    forcePathStyle: true,
  });
}

async function imageDataToBuffer(
  imageData: string,
): Promise<{ buffer: Buffer; contentType: string }> {
  if (imageData.startsWith("data:")) {
    const [header, base64] = imageData.split(",");
    const contentType = header.match(/data:([^;]+)/)?.[1] ?? "image/png";
    return { buffer: Buffer.from(base64, "base64"), contentType };
  }

  const response = await fetch(imageData);

  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.statusText}`);
  }

  return {
    buffer: Buffer.from(await response.arrayBuffer()),
    contentType: response.headers.get("content-type") ?? "image/png",
  };
}

export async function uploadImage(imageData: string, key: string, env: StorageEnv) {
  const { buffer, contentType } = await imageDataToBuffer(imageData);
  const client = createS3Client(env);

  await client.send(
    new PutObjectCommand({
      Bucket: env.s3Bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    }),
  );

  return `${env.s3PublicUrl}/${env.s3Bucket}/${key}`;
}
