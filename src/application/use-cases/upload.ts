import { BadRequestException, Injectable } from '@nestjs/common';
import { UploadFileDto } from 'src/infra/dtos/uploadFile.dto';
import { StorageService } from 'src/infra/tools/storage.service';

@Injectable()
export class UploadUseCase {
  constructor(private readonly storageService: StorageService) {}

  async execute(uploadDto: UploadFileDto) {
    let buffer: Buffer;
    if (uploadDto.file.buffer) {
      buffer =
        uploadDto.file.buffer instanceof Buffer
          ? uploadDto.file.buffer
          : Buffer.from(uploadDto.file.buffer);
    } else if (uploadDto.file.path) {
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

    return {
      url: fileUrl,
    };
  }
}
