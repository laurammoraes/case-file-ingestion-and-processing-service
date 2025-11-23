import { Injectable } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  //   GetObjectCommand,
  //   DeleteObjectCommand
} from '@aws-sdk/client-s3';
// import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { ParametersService } from './parameters.service';

@Injectable()
export class StorageService {
  private storageClient: S3Client;
  private bucketName: string = 'files-processor';

  constructor(private readonly parametersService: ParametersService) {
    this.storageClient = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: this.parametersService.AWS_ACCESS_KEY_ID,
        secretAccessKey: this.parametersService.AWS_SECRET_ACCESS_KEY,
      },
    });
  }

  async uploadFile(buffer: Buffer, filename: string, contentType: string) {
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: filename,
      Body: buffer,
      ContentType: contentType,
    });

    await this.storageClient.send(command);
    return this.getFileUrl(filename);
  }

  getFileUrl(filename: string): string {
    const region = process.env.AWS_REGION || 'us-east-1';
    return `https://${this.bucketName}.s3.${region}.amazonaws.com/${filename}`;
  }

  // async getFileUrl(key: string): Promise<string> {
  //   const command = new GetObjectCommand({
  //     Bucket: this.bucketName,
  //     Key: key,
  //   });

  //   const url = await getSignedUrl(this.storageClient, command, {
  //     expiresIn: 60 * 60 * 24,
  //   });

  //   return url;
  // }

  // async deleteFile(filename: string) {
  //   const command = new DeleteObjectCommand({
  //     Bucket: this.bucketName,
  //     Key: filename,
  //   });

  //   await this.storageClient.send(command);
  // }
}
