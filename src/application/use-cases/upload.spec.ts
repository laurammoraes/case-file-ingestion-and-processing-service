import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { UploadUseCase } from './upload';
import { StorageService } from 'src/infra/tools/storage.service';
import { UploadFileDto } from 'src/infra/dtos/uploadFile.dto';
import * as fs from 'fs/promises';

jest.mock('fs/promises');

describe('UploadUseCase', () => {
  let useCase: UploadUseCase;
  let storageService: jest.Mocked<StorageService>;

  const mockStorageService = {
    uploadFile: jest.fn(),
    getFileUrl: jest.fn(),
    deleteFile: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UploadUseCase,
        {
          provide: StorageService,
          useValue: mockStorageService,
        },
      ],
    }).compile();

    useCase = module.get<UploadUseCase>(UploadUseCase);
    storageService = module.get(StorageService);

    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('deve fazer upload de arquivo com buffer com sucesso', async () => {
      const mockFile: Express.Multer.File = {
        fieldname: 'file',
        originalname: 'test.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        size: 1024,
        buffer: Buffer.from('test content'),
        destination: '',
        filename: '',
        path: '',
        stream: null as any,
      };

      const uploadDto: UploadFileDto = {
        filename: 'test.jpg',
        file: mockFile,
      };

      storageService.uploadFile.mockResolvedValue(
        'https://s3.amazonaws.com/files/test.jpg/test.jpg',
      );

      const result = await useCase.execute(uploadDto);

      expect(storageService.uploadFile).toHaveBeenCalledWith(
        mockFile.buffer,
        'files/test.jpg/test.jpg',
        'image/jpeg',
      );
      expect(result).toEqual({
        url: 'https://s3.amazonaws.com/files/test.jpg/test.jpg',
      });
    });

    it('deve fazer upload de arquivo com path quando não houver buffer', async () => {
      const mockFile: Express.Multer.File = {
        fieldname: 'file',
        originalname: 'test.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        size: 1024,
        buffer: undefined,
        destination: '',
        filename: '',
        path: '/tmp/test.jpg',
        stream: null as any,
      };

      const uploadDto: UploadFileDto = {
        filename: 'test.jpg',
        file: mockFile,
      };

      const fileBuffer = Buffer.from('file content');
      (fs.readFile as jest.Mock).mockResolvedValue(fileBuffer);
      storageService.uploadFile.mockResolvedValue(
        'https://s3.amazonaws.com/files/test.jpg/test.jpg',
      );

      const result = await useCase.execute(uploadDto);

      expect(fs.readFile).toHaveBeenCalledWith('/tmp/test.jpg');
      expect(storageService.uploadFile).toHaveBeenCalledWith(
        fileBuffer,
        'files/test.jpg/test.jpg',
        'image/jpeg',
      );
      expect(result).toEqual({
        url: 'https://s3.amazonaws.com/files/test.jpg/test.jpg',
      });
    });

    it('deve converter buffer não-Buffer para Buffer', async () => {
      const mockFile: Express.Multer.File = {
        fieldname: 'file',
        originalname: 'test.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        size: 1024,
        buffer: new Uint8Array([1, 2, 3]) as any,
        destination: '',
        filename: '',
        path: '',
        stream: null as any,
      };

      const uploadDto: UploadFileDto = {
        filename: 'test.jpg',
        file: mockFile,
      };

      storageService.uploadFile.mockResolvedValue(
        'https://s3.amazonaws.com/files/test.jpg/test.jpg',
      );

      const result = await useCase.execute(uploadDto);

      expect(storageService.uploadFile).toHaveBeenCalled();
      const callArgs = storageService.uploadFile.mock.calls[0];
      expect(callArgs[0]).toBeInstanceOf(Buffer);
      expect(result).toHaveProperty('url');
    });

    it('deve lançar erro se não houver buffer nem path', async () => {
      const mockFile: Express.Multer.File = {
        fieldname: 'file',
        originalname: 'test.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        size: 1024,
        buffer: undefined,
        destination: '',
        filename: '',
        path: undefined,
        stream: null as any,
      };

      const uploadDto: UploadFileDto = {
        filename: 'test.jpg',
        file: mockFile,
      };

      await expect(useCase.execute(uploadDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(useCase.execute(uploadDto)).rejects.toThrow(
        'File buffer or path is required',
      );
    });

    it('deve usar o mimetype correto do arquivo', async () => {
      const pdfFile: Express.Multer.File = {
        fieldname: 'file',
        originalname: 'test.pdf',
        encoding: '7bit',
        mimetype: 'application/pdf',
        size: 2048,
        buffer: Buffer.from('pdf content'),
        destination: '',
        filename: '',
        path: '',
        stream: null as any,
      };

      const uploadDto: UploadFileDto = {
        filename: 'test.pdf',
        file: pdfFile,
      };

      storageService.uploadFile.mockResolvedValue(
        'https://s3.amazonaws.com/files/test.pdf/test.pdf',
      );

      await useCase.execute(uploadDto);

      expect(storageService.uploadFile).toHaveBeenCalledWith(
        expect.any(Buffer),
        'files/test.pdf/test.pdf',
        'application/pdf',
      );
    });
  });
});
