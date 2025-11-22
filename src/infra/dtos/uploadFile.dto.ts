import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UploadFileDto {
  @ApiProperty({ description: 'File name' })
  @IsNotEmpty()
  @IsString()
  filename: string;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Upload a JPEG or PDF file',
  })
  @IsNotEmpty()
  file: Express.Multer.File;

  @ApiProperty({ description: 'Created at', required: false })
  @IsDate()
  @IsOptional()
  created_at?: Date;

  @ApiProperty({ description: 'Updated at', required: false })
  @IsDate()
  @IsOptional()
  updated_at?: Date;

  @ApiProperty({ description: 'Deleted at', required: false })
  @IsDate()
  @IsOptional()
  deleted_at?: Date | null;
}
