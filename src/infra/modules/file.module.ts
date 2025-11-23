import { Module } from '@nestjs/common';
import { FilesController } from '../controllers/file.controller';
import { FilesService } from '../../domain/services/file.service';
import { MulterModule } from '@nestjs/platform-express';
import { FileRepository } from '../../domain/repositories/file.repositories';
import { PgService } from '../database/pg.service';
import { StorageService } from '../s3/storage.service';
import { ParametersService } from '../s3/parameters.service';
import { UploadUseCase } from 'src/application/use-cases/upload';

@Module({
  imports: [
    MulterModule.register({
      dest: './uploads',
    }),
  ],
  controllers: [FilesController],
  providers: [
    FilesService,
    FileRepository,
    PgService,
    StorageService,
    ParametersService,
    UploadUseCase,
  ],
  exports: [FilesService],
})
export class FilesModule {}