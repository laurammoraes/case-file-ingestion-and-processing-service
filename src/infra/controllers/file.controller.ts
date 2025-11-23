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
  ApiTags,
} from '@nestjs/swagger';
import { UploadFileDto } from '../dtos/uploadFile.dto';
@ApiTags('Files')
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
    try {
      if (!file) {
        throw new BadRequestException('File is required');
      }
      const uploadDto: UploadFileDto = {
        filename: body.filename || file.originalname,
        file: file,
      };
      return await this.filesService.uploadFile(uploadDto);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      const message = error?.message || error?.toString() || 'An error occurred';
      throw new BadRequestException(message);
    }
  }

  @ApiOperation({ summary: 'Get all files' })
  @ApiResponse({ status: 200, description: 'Files retrieved successfully' })
  @Get('')
  async getFiles(): Promise<any> {
    try {
      return await this.filesService.getAllFiles();
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      const message = error?.message || error?.toString() || 'An error occurred';
      throw new BadRequestException(message);
    }
  }

  @ApiOperation({ summary: 'Get file by name' })
  @ApiResponse({ status: 200, description: 'File retrieved successfully' })
  @ApiParam({ name: 'name', description: 'File name' })
  @Get('/fileName')
  async getFileById(@Param('name') fileName: string) {
    try {
      return await this.filesService.getFileByFileName(fileName);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      const message = error?.message || error?.toString() || 'An error occurred';
      throw new BadRequestException(message);
    }
  }

  @ApiOperation({ summary: 'Delete file by name' })
  @ApiResponse({ status: 200, description: 'File deleted successfully' })
  @ApiParam({ name: 'name', description: 'File name' })
  @Delete('/:name')
  async deleteFileById(@Param('name') name: string) {
    try {
      return await this.filesService.deleteFileByFileName(name);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      const message = error?.message || error?.toString() || 'An error occurred';
      throw new BadRequestException(message);
    }
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
    try {
      return await this.filesService.updateFile(body.filename, file);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      const message = error?.message || error?.toString() || 'An error occurred';
      throw new BadRequestException(message);
    }
  }
}
