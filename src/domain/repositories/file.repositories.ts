import { Injectable } from '@nestjs/common';
import { PgService } from 'src/infra/database/pg.service';
@Injectable()
export class FileRepository {
  constructor(private readonly pgService: PgService) {}

  async create(filename: string) {
    return await this.pgService.$transaction(async (tx) => {
      return await tx.files.create({
        data: {
          fileName: filename,
          fileUrl: '',
          created_at: new Date(),
          updated_at: new Date(),
          deleted_at: null,
        },
      });
    });
  }
}