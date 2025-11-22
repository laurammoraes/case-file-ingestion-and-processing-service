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
}