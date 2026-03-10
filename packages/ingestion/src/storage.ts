import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

export interface StorageConfig {
  endpoint: string;
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  useSsl: boolean;
}

export class StorageService {
  private client: S3Client;
  private bucket: string;

  constructor(config: StorageConfig) {
    this.client = new S3Client({
      endpoint: config.endpoint,
      region: config.region,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
      forcePathStyle: true, // Required for Garage
      tls: config.useSsl,
    });
    this.bucket = config.bucket;
  }

  /**
   * Archives a raw payload to S3.
   * @param key The object key (path in bucket)
   * @param payload The raw payload to store
   * @param contentType The content type (defaults to application/json)
   */
  async archive(key: string, payload: unknown, contentType = "application/json"): Promise<void> {
    const body = typeof payload === "string" ? payload : JSON.stringify(payload);
    
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
      })
    );
  }
}
