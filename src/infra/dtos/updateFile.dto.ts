import { ApiProperty } from '@nestjs/swagger';
import { UploadFileDto } from './uploadFile.dto';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateFileDto extends UploadFileDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Upload a JPEG or PDF file',
  })
  @IsNotEmpty()
  file: Express.Multer.File;

  @ApiProperty({ description: 'File name' })
  @IsNotEmpty()
  @IsString()
  filename: string;
}