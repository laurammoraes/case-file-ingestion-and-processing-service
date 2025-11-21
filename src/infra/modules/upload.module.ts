import { Module } from '@nestjs/common';
import { UploadController } from '../../infra/controllers/upload.controller';
import { UploadService } from '../../domain/services/upload.service';
import { MulterModule } from '@nestjs/platform-express';

@Module({
  imports: [
    MulterModule.register({
      dest: './uploads',
    }),
  ],
  controllers: [UploadController],
  providers: [UploadService],
})
export class UploadModule {}