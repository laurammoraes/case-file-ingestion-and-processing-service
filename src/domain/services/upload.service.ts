import { Injectable, UploadedFile } from '@nestjs/common';

@Injectable()
export class UploadService {
  constructor(
    // private readonly fileRepository: FileRepository,
    // private readonly storageProvider: StorageProvider,
  ) {}

  async uploadFile(@UploadedFile() file: any) {
    // const storage = this.storageProvider.upload(file);
    // const file = await this.fileRepository.create(storage.filename);
    return file;
  }
}