import { Injectable } from '@nestjs/common';
import { PgService } from 'src/infra/database/pg.service';
@Injectable()
export class FileRepository {
  constructor(private readonly pgService: PgService) {}

  async create(fileData: { fileName: string; fileUrl: any }) {
    return await this.pgService.$transaction(async (tx) => {
      return await tx.files.create({
        data: {
          fileName: fileData.fileName,
          fileUrl: fileData.fileUrl,
          created_at: new Date(),
          updated_at: new Date(),
          deleted_at: null,
        },
      });
    });
  }

  async getAllFiles() {
    return await this.pgService.files.findMany({
      where: {
        deleted_at: null,
      },
      select: {
        id: true,
        fileName: true,
        fileUrl: true,
        created_at: true,
        updated_at: true,
      },
      orderBy: {
        created_at: 'desc',
      },
    });
  }

  async getFileByName(fileName: string) {
    return await this.pgService.files.findFirst({
      where: {
        fileName: fileName,
        deleted_at: null,
      },
      select: {
        id: true,
        fileName: true,
        fileUrl: true,
        created_at: true,
        updated_at: true,
      },
    });
  }
}