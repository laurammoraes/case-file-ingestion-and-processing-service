import { BadRequestException, Injectable } from '@nestjs/common';
import { FileRepository } from '../repositories/file.repositories';
import { StorageService } from 'src/infra/s3/storage.service';
import { UploadFileDto } from 'src/infra/dtos/uploadFile.dto';

@Injectable()
export class UploadService {
  constructor(
    private readonly fileRepository: FileRepository,
    private readonly storageService: StorageService,
  ) {}

  async uploadFile(uploadDto: UploadFileDto) {
    if (!uploadDto) {
      throw new BadRequestException('Upload data is required');
    }

    if (!uploadDto.filename) {
      throw new BadRequestException('File name is required');
    }

    if (!uploadDto.file) {
      throw new BadRequestException('File is required');
    }

    if (
      !uploadDto.file.mimetype.includes('image/jpeg') &&
      !uploadDto.file.mimetype.includes('application/pdf')
    ) {
      throw new BadRequestException('File must be a JPEG or PDF');
    }

    if (uploadDto.file.size > 1024 * 1024 * 5) {
      throw new BadRequestException('File must be less than 5MB');
    }

    // O arquivo pode vir com buffer (memória) ou path (disco)
    let buffer: Buffer;
    if (uploadDto.file.buffer) {
      // Arquivo em memória
      buffer =
        uploadDto.file.buffer instanceof Buffer
          ? uploadDto.file.buffer
          : Buffer.from(uploadDto.file.buffer);
    } else if (uploadDto.file.path) {
      // Arquivo em disco
      const fs = await import('fs/promises');
      buffer = await fs.readFile(uploadDto.file.path);
    } else {
      throw new BadRequestException(
        `File buffer or path is required. File object: ${JSON.stringify({
          hasBuffer: !!uploadDto.file.buffer,
          hasPath: !!uploadDto.file.path,
          keys: Object.keys(uploadDto.file),
        })}`,
      );
    }

    const contentType = uploadDto.file.mimetype;

    const path = `files/${uploadDto.filename}`;
    const filename = `${path}/${uploadDto.filename}`;

    const fileUrl = await this.storageService.uploadFile(
      buffer,
      filename,
      contentType,
    );

    const fileData: { fileName: string; fileUrl: string } = {
      fileName: uploadDto.filename,
      fileUrl: fileUrl,
    };

    const fileCreated = await this.fileRepository.create(fileData);
    return fileCreated;
  }
}
