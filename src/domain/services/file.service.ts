import { BadRequestException, Injectable } from '@nestjs/common';
import { FileRepository } from '../repositories/file.repositories';
import { StorageService } from 'src/infra/tools/storage.service';
import { UploadFileDto } from 'src/infra/dtos/uploadFile.dto';
import { UploadUseCase } from 'src/application/use-cases/upload';

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
    private readonly uploadUseCase: UploadUseCase,
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

    const fileUrl = await this.uploadUseCase.execute(uploadDto);
    if (!fileUrl) {
      throw new BadRequestException('Failed to upload file');
    }

    const fileData: { fileName: string; fileUrl: string } = {
      fileName: uploadDto.filename,
      fileUrl: fileUrl.url,
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

  async updateFile(fileName: string, file: Express.Multer.File) {
    const fileExists = await this.fileRepository.getFileByName(fileName);
    if (!fileExists) {
      throw new BadRequestException('File not found');
    }

    if (!file) {
      throw new BadRequestException('File is required');
    }
    if (
      !file.mimetype.includes('image/jpeg') &&
      !file.mimetype.includes('application/pdf')
    ) {
      throw new BadRequestException('File must be a JPEG or PDF');
    }

    if (file.size > 1024 * 1024 * 5) {
      throw new BadRequestException('File must be less than 5MB');
    }

    const fileUrl = await this.uploadUseCase.execute({
      filename: `${fileName}.updated`,
      file: file,
    });
    if (!fileUrl) {
      throw new BadRequestException('Failed to upload file');
    }

    const fileData: { fileName: string; fileUrl: string } = {
      fileName: `${fileName}`,
      fileUrl: fileUrl.url,
    };
    return this.fileRepository.updateFile(fileExists.id, fileData);
  }

  async deleteFileByFileName(fileName: string) {
    const fileExists = await this.fileRepository.getFileByName(fileName);
    if (!fileExists) {
      throw new BadRequestException('File not found');
    }

    await this.storageService.deleteFile(fileExists.fileName);

    const deletedFile = await this.fileRepository.deleteFile(fileExists.id);
    if (!deletedFile) {
      throw new BadRequestException('Failed to delete file');
    }

    return deletedFile;
  }
}
