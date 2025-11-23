import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { FilesController } from './file.controller';
import { FilesService } from '../../domain/services/file.service';

describe('FilesController', () => {
  let controller: FilesController;
  let filesService: jest.Mocked<FilesService>;

  const mockFilesService = {
    uploadFile: jest.fn(),
    getAllFiles: jest.fn(),
    getFileByFileName: jest.fn(),
    updateFile: jest.fn(),
    deleteFileByFileName: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FilesController],
      providers: [
        {
          provide: FilesService,
          useValue: mockFilesService,
        },
      ],
    }).compile();

    controller = module.get<FilesController>(FilesController);
    filesService = module.get(FilesService);

    jest.clearAllMocks();
  });

  describe('uploadFile', () => {
    const mockFile: Express.Multer.File = {
      fieldname: 'file',
      originalname: 'test.jpg',
      encoding: '7bit',
      mimetype: 'image/jpeg',
      size: 1024,
      buffer: Buffer.from('test'),
      destination: '',
      filename: '',
      path: '',
      stream: null as any,
    };

    it('deve fazer upload de arquivo com sucesso', async () => {
      const expectedResult = {
        id: 1,
        fileName: 'test.jpg',
        fileUrl: 'https://s3.amazonaws.com/test.jpg',
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
      };

      filesService.uploadFile.mockResolvedValue(expectedResult);

      const result = await controller.uploadFile(mockFile, {
        filename: 'test.jpg',
      });

      expect(filesService.uploadFile).toHaveBeenCalledWith({
        filename: 'test.jpg',
        file: mockFile,
      });
      expect(result).toEqual(expectedResult);
    });

    it('deve usar originalname quando filename não for fornecido', async () => {
      const expectedResult = {
        id: 1,
        fileName: 'test.jpg',
        fileUrl: 'https://s3.amazonaws.com/test.jpg',
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
      };

      filesService.uploadFile.mockResolvedValue(expectedResult);

      const result = await controller.uploadFile(mockFile, { filename: '' });

      expect(filesService.uploadFile).toHaveBeenCalledWith({
        filename: 'test.jpg',
        file: mockFile,
      });
      expect(result).toEqual(expectedResult);
    });

    it('deve lançar BadRequestException se arquivo não for fornecido', async () => {
      await expect(
        controller.uploadFile(null as any, { filename: 'test.jpg' }),
      ).rejects.toThrow(BadRequestException);
      await expect(
        controller.uploadFile(null as any, { filename: 'test.jpg' }),
      ).rejects.toThrow('File is required');
    });

    it('deve lançar BadRequestException se houver erro no serviço', async () => {
      filesService.uploadFile.mockRejectedValue(new Error('Service error'));

      await expect(
        controller.uploadFile(mockFile, { filename: 'test.jpg' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getFiles', () => {
    it('deve retornar todos os arquivos', async () => {
      const expectedResult = {
        files: [
          {
            id: 1,
            fileName: 'test1.jpg',
            fileUrl: 'https://s3.amazonaws.com/test1.jpg',
            created_at: '01/01/2024',
            updated_at: '01/01/2024',
          },
        ],
        pagination: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      };

      filesService.getAllFiles.mockResolvedValue(expectedResult);

      const result = await controller.getFiles();

      expect(filesService.getAllFiles).toHaveBeenCalled();
      expect(result).toEqual(expectedResult);
    });

    it('deve lançar BadRequestException se houver erro no serviço', async () => {
      filesService.getAllFiles.mockRejectedValue(new Error('Service error'));

      await expect(controller.getFiles()).rejects.toThrow('Service error');
    });
  });

  describe('getFileById', () => {
    it('deve retornar arquivo pelo nome', async () => {
      const expectedResult = {
        id: 1,
        fileName: 'test.jpg',
        fileUrl: 'https://s3.amazonaws.com/test.jpg',
        created_at: '01/01/2024',
        updated_at: '01/01/2024',
      };

      filesService.getFileByFileName.mockResolvedValue(expectedResult);

      const result = await controller.getFileById('test.jpg');

      expect(filesService.getFileByFileName).toHaveBeenCalledWith('test.jpg');
      expect(result).toEqual(expectedResult);
    });

    it('deve lançar BadRequestException se arquivo não for encontrado', async () => {
      filesService.getFileByFileName.mockRejectedValue(
        new BadRequestException('File not found'),
      );

      await expect(controller.getFileById('nonexistent.jpg')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('deleteFileById', () => {
    it('deve deletar arquivo com sucesso', async () => {
      const expectedResult = {
        id: 1,
        fileName: 'test.jpg',
        fileUrl: 'https://s3.amazonaws.com/test.jpg',
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: new Date(),
      };

      filesService.deleteFileByFileName.mockResolvedValue(expectedResult);

      const result = await controller.deleteFileById('test.jpg');

      expect(filesService.deleteFileByFileName).toHaveBeenCalledWith(
        'test.jpg',
      );
      expect(result).toEqual(expectedResult);
    });

    it('deve lançar BadRequestException se houver erro no serviço', async () => {
      filesService.deleteFileByFileName.mockRejectedValue(
        new BadRequestException('File not found'),
      );

      await expect(
        controller.deleteFileById('nonexistent.jpg'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('updateFileById', () => {
    const mockFile: Express.Multer.File = {
      fieldname: 'file',
      originalname: 'test.jpg',
      encoding: '7bit',
      mimetype: 'image/jpeg',
      size: 1024,
      buffer: Buffer.from('test'),
      destination: '',
      filename: '',
      path: '',
      stream: null as any,
    };

    it('deve atualizar arquivo com sucesso', async () => {
      const expectedResult = {
        id: 1,
        fileName: 'test.jpg',
        fileUrl: 'https://s3.amazonaws.com/test-updated.jpg',
        created_at: new Date(),
        updated_at: new Date(),
      };

      filesService.updateFile.mockResolvedValue(expectedResult);

      const result = await controller.updateFileById(mockFile, {
        filename: 'test.jpg',
      });

      expect(filesService.updateFile).toHaveBeenCalledWith(
        'test.jpg',
        mockFile,
      );
      expect(result).toEqual(expectedResult);
    });

    it('deve lançar BadRequestException se houver erro no serviço', async () => {
      filesService.updateFile.mockRejectedValue(
        new BadRequestException('File not found'),
      );

      await expect(
        controller.updateFileById(mockFile, { filename: 'test.jpg' }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
