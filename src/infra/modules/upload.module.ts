import { Module } from '@nestjs/common';
import { UploadController } from '../../infra/controllers/upload.controller';
import { UploadService } from '../../domain/services/upload.service';
import { MulterModule } from '@nestjs/platform-express';
import { FileRepository } from 'src/domain/repositories/file.repositories';
import { PgService } from '../database/pg.service';

@Module({
  imports: [
    MulterModule.register({
      dest: './uploads',
    }),
  ],
  controllers: [UploadController],
  providers: [UploadService, FileRepository, PgService],
})
export class UploadModule {}