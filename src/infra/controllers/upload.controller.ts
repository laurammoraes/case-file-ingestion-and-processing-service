import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Delete,
  Put,
} from '@nestjs/common';
import { UploadService } from '../../domain/services/upload.service';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { UploadFileDto } from '../dtos/uploadFile.dto';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @ApiOperation({ summary: 'Upload file' })
  @ApiResponse({ status: 200, description: 'File uploaded successfully' })
  @ApiBody({ type: UploadFileDto })
  @Post('')
  async uploadFile(@Body() body: UploadFileDto) {
    return this.uploadService.uploadFile(body);
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
  async getFileById(@Param('id') id: string) {
    // return this.uploadService.getFileById(id);
    return [];
  }

  @ApiOperation({ summary: 'Delete file by id' })
  @ApiResponse({ status: 200, description: 'File deleted successfully' })
  @ApiParam({ name: 'id', description: 'File id' })
  @Delete('files/:id')
  async deleteFileById(@Param('id') id: string) {
    // return this.uploadService.deleteFileById(id);
    return [];
  }

  @ApiOperation({ summary: 'Update file by id' })
  @ApiResponse({ status: 200, description: 'File updated successfully' })
  @ApiParam({ name: 'id', description: 'File id' })
  @ApiBody({ type: UploadFileDto })
  @Put('files/:id')
  async updateFileById(@Param('id') id: string, @Body() body: UploadFileDto) {
    // return this.uploadService.updateFileById(id, body);
    return [];
  }
}
