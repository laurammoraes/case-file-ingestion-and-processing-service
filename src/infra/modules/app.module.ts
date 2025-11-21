import { Module } from '@nestjs/common';
import { AppController } from '../controllers/app.controller';
import { AppService } from '../../domain/services/app.service';
import { UploadController } from '../controllers/upload.controller';
import { UploadService } from 'src/domain/services/upload.service';

@Module({
  imports: [],
  controllers: [AppController, UploadController],
  providers: [AppService, UploadService],
})
export class AppModule {}
