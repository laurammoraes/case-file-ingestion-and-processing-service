import { Injectable, UploadedFile } from '@nestjs/common';
import { FileRepository } from '../repositories/file.repositories';

@Injectable()
export class UploadService {
  constructor(
    private readonly fileRepository: FileRepository,
    // private readonly storageProvider: StorageProvider,
  ) {}

  async uploadFile(@UploadedFile() file: any) {
    const fileCreated = await this.fileRepository.create(file.filename);
    return fileCreated;
  }
}