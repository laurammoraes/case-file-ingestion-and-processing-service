import {
  BadRequestException,
  Controller,
  Post,
  Body,
  Get,
  Param,
  Delete,
  Put,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from '../../domain/services/upload.service';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';
import { UploadFileDto } from '../dtos/uploadFile.dto';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @ApiOperation({ summary: 'Upload file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        filename: {
          type: 'string',
          description: 'File name',
        },
        file: {
          type: 'string',
          format: 'binary',
          description: 'File to upload',
        },
      },
      required: ['filename', 'file'],
    },
  })
  @ApiResponse({ status: 200, description: 'File uploaded successfully' })
  @UseInterceptors(FileInterceptor('file'))
  @Post('')
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: { filename: string },
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    const uploadDto: UploadFileDto = {
      filename: body.filename || file.originalname,
      file: file,
    };
    return this.uploadService.uploadFile(uploadDto);
  }

  @ApiOperation({ summary: 'Get all files' })
  @ApiResponse({ status: 200, description: 'Files retrieved successfully' })
  @Get('files')
  async getFiles() {
    // return this.uploadService.getFiles();
    return [];
  }

  @ApiOperation({ summary: 'Get file by id' })
  @ApiResponse({ status: 200, description: 'File retrieved successfully' })
  @ApiParam({ name: 'id', description: 'File id' })
  @Get('files/:id')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getFileById(@Param('id') _id: string) {
    // return this.uploadService.getFileById(id);
    return [];
  }

  @ApiOperation({ summary: 'Delete file by id' })
  @ApiResponse({ status: 200, description: 'File deleted successfully' })
  @ApiParam({ name: 'id', description: 'File id' })
  @Delete('files/:id')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async deleteFileById(@Param('id') _id: string) {
    // return this.uploadService.deleteFileById(id);
    return [];
  }

  @ApiOperation({ summary: 'Update file by id' })
  @ApiResponse({ status: 200, description: 'File updated successfully' })
  @ApiParam({ name: 'id', description: 'File id' })
  @ApiBody({ type: UploadFileDto })
  @Put('files/:id')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async updateFileById(@Param('id') _id: string, @Body() _body: UploadFileDto) {
    // return this.uploadService.updateFileById(id, body);
    return [];
  }
}
