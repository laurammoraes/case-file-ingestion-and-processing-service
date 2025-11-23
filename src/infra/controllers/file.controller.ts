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
import { FilesService } from '../../domain/services/file.service';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';
import { UploadFileDto } from '../dtos/uploadFile.dto';
import { UpdateFileDto } from '../dtos/updateFile.dto';


@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

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
    return this.filesService.uploadFile(uploadDto);
  }

  @ApiOperation({ summary: 'Get all files' })
  @ApiResponse({ status: 200, description: 'Files retrieved successfully' })
  @Get('')
  async getFiles(): Promise<any> {
    return await this.filesService.getAllFiles();
  }

  @ApiOperation({ summary: 'Get file by name' })
  @ApiResponse({ status: 200, description: 'File retrieved successfully' })
  @ApiParam({ name: 'name', description: 'File name' })
  @Get('/fileName')
  async getFileById(@Param('name') fileName: string) {
    return this.filesService.getFileByFileName(fileName);
  }

  @ApiOperation({ summary: 'Delete file by id' })
  @ApiResponse({ status: 200, description: 'File deleted successfully' })
  @ApiParam({ name: 'id', description: 'File id' })
  @Delete('files/:id')
  async deleteFileById(@Param('id') _id: string) {
    // return this.uploadService.deleteFileById(id);
    return [];
  }

  @ApiOperation({ summary: 'Update file by name' })
  @ApiResponse({ status: 200, description: 'File updated successfully' })
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
  @UseInterceptors(FileInterceptor('file'))
  @Put('/fileName')
  async updateFileById(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: { filename: string },
  ) {
    return this.filesService.updateFile(body.filename, file);
  }
}
