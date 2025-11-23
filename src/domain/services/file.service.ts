import { BadRequestException, Injectable } from '@nestjs/common';
import { FileRepository } from '../repositories/file.repositories';
import { StorageService } from 'src/infra/s3/storage.service';
import { UploadFileDto } from 'src/infra/dtos/uploadFile.dto';

interface File {
  id: number;
  fileName: string;
  fileUrl: string;
  created_at: string;
  updated_at: string;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface FileResponse {
  files: File[];
  pagination: Pagination;
}

@Injectable()
export class FilesService {
  constructor(
    private readonly fileRepository: FileRepository,
    private readonly storageService: StorageService,
  ) {}

  async uploadFile(uploadDto: UploadFileDto) {
    const name = await this.fileRepository.getFileByName(uploadDto.filename);
    if (name) {
      throw new BadRequestException('File name already exists');
    }

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

    const fileData: { fileName: string; fileUrl: string } = {
      fileName: uploadDto.filename,
      fileUrl: fileUrl,
    };

    const fileCreated = await this.fileRepository.create(fileData);
    return fileCreated;
  }

  async getAllFiles(): Promise<FileResponse> {

    const files = await this.fileRepository.getAllFiles();

    const filesData = files.map((file) => {
      return {
        id: file.id,
        fileName: file.fileName,
        fileUrl: file.fileUrl,
        created_at: new Date(file.created_at).toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        }),
        updated_at: new Date(file.updated_at).toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        }),
      };
    });

    return {
      files: filesData,
      pagination: {
        total: files.length,
        page: 1,
        limit: 10,
        totalPages: Math.ceil(files.length / 10),
      },
    };
  }

  async getFileByFileName(fileName: string) {

    const file = await this.fileRepository.getFileByName(fileName);

    if (!file) {
      throw new BadRequestException('File not found');
    }

    return {
      id: file.id,
      fileName: file.fileName,
      fileUrl: file.fileUrl,
      created_at: new Date(file.created_at).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }),
      updated_at: new Date(file.updated_at).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }),
    };
  }
}