import { Module } from '@nestjs/common';
import { AppController } from '../controllers/app.controller';
import { AppService } from '../../domain/services/app.service';
import { UploadModule } from './upload.module';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [UploadModule, DatabaseModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
