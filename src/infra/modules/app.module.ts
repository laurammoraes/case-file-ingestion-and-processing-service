import { Module } from '@nestjs/common';
import { AppController } from '../controllers/app.controller';
import { AppService } from '../../domain/services/app.service';
import { FilesModule } from './file.module';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [FilesModule, DatabaseModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
