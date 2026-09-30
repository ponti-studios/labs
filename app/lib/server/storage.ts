import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

type StorageEnv = {
  r2Endpoint: string;
  r2Bucket: string;
  r2AccessKeyId: string;
  r2SecretAccessKey: string;
  r2PublicUrl: string;
};

function getIsLocalEndpoint(endpoint: string): boolean {
  const hostname = new URL(endpoint).hostname;
  return ["localhost", "127.0.0.1", "::1", "host.docker.internal", "minio"].includes(hostname);
}

function createS3Client(env: StorageEnv) {
  const isLocalEndpoint = getIsLocalEndpoint(env.r2Endpoint);
  return new S3Client({
    endpoint: env.r2Endpoint,
    region: isLocalEndpoint ? "us-east-1" : "auto",
    credentials: {
      accessKeyId: env.r2AccessKeyId,
      secretAccessKey: env.r2SecretAccessKey,
    },
    forcePathStyle: isLocalEndpoint,
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
      Bucket: env.r2Bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    }),
  );

  return `${env.r2PublicUrl}/${env.r2Bucket}/${key}`;
}
