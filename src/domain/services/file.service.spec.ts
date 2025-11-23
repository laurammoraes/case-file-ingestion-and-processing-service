import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { FilesService } from './file.service';
import { FileRepository } from '../repositories/file.repositories';
import { StorageService } from 'src/infra/tools/storage.service';
import { UploadUseCase } from 'src/application/use-cases/upload';
import { UploadFileDto } from 'src/infra/dtos/uploadFile.dto';

describe('FilesService', () => {
  let service: FilesService;
  let fileRepository: jest.Mocked<FileRepository>;
  let uploadUseCase: jest.Mocked<UploadUseCase>;
  let storageService: jest.Mocked<StorageService>;

  const mockFileRepository = {
    create: jest.fn(),
    getAllFiles: jest.fn(),
    getFileByName: jest.fn(),
    updateFile: jest.fn(),
    deleteFile: jest.fn(),
  };

  const mockUploadUseCase = {
    execute: jest.fn(),
  };

  const mockStorageService = {
    uploadFile: jest.fn(),
    getFileUrl: jest.fn(),
    deleteFile: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FilesService,
        {
          provide: FileRepository,
          useValue: mockFileRepository,
        },
        {
          provide: UploadUseCase,
          useValue: mockUploadUseCase,
        },
        {
          provide: StorageService,
          useValue: mockStorageService,
        },
      ],
    }).compile();

    service = module.get<FilesService>(FilesService);
    fileRepository = module.get(FileRepository);
    uploadUseCase = module.get(UploadUseCase);
    storageService = module.get(StorageService);

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

    const uploadDto: UploadFileDto = {
      filename: 'test.jpg',
      file: mockFile,
    };

    it('deve fazer upload de arquivo com sucesso', async () => {
      fileRepository.getFileByName.mockResolvedValue(null);
      uploadUseCase.execute.mockResolvedValue({
        url: 'https://s3.amazonaws.com/test.jpg',
      });
      fileRepository.create.mockResolvedValue({
        id: 1,
        fileName: 'test.jpg',
        fileUrl: 'https://s3.amazonaws.com/test.jpg',
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
      });

      const result = await service.uploadFile(uploadDto);

      expect(fileRepository.getFileByName).toHaveBeenCalledWith('test.jpg');
      expect(uploadUseCase.execute).toHaveBeenCalledWith(uploadDto);
      expect(fileRepository.create).toHaveBeenCalledWith({
        fileName: 'test.jpg',
        fileUrl: 'https://s3.amazonaws.com/test.jpg',
      });
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('fileName', 'test.jpg');
    });

    it('deve lançar erro se o nome do arquivo já existir', async () => {
      fileRepository.getFileByName.mockResolvedValue({
        id: 1,
        fileName: 'test.jpg',
        fileUrl: 'https://s3.amazonaws.com/test.jpg',
        created_at: new Date(),
        updated_at: new Date(),
      });

      await expect(service.uploadFile(uploadDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.uploadFile(uploadDto)).rejects.toThrow(
        'File name already exists',
      );
    });

    it('deve lançar erro se uploadDto não for fornecido', async () => {
      await expect(service.uploadFile(null as any)).rejects.toThrow(
        'File is required',
      );
    });

    it('deve lançar erro se filename não for fornecido', async () => {
      const invalidDto = { ...uploadDto, filename: '' };

      fileRepository.getFileByName.mockResolvedValue(null);

      await expect(service.uploadFile(invalidDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.uploadFile(invalidDto)).rejects.toThrow(
        'File name is required',
      );
    });

    it('deve lançar erro se file não for fornecido', async () => {
      const invalidDto = { ...uploadDto, file: null };
      
      fileRepository.getFileByName.mockResolvedValue(null);

      await expect(service.uploadFile(invalidDto as any)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.uploadFile(invalidDto as any)).rejects.toThrow(
        'File is required',
      );
    });

    it('deve lançar erro se o arquivo não for JPEG ou PDF', async () => {
      const invalidFile = { ...mockFile, mimetype: 'text/plain' };
      const invalidDto = { ...uploadDto, file: invalidFile };

      fileRepository.getFileByName.mockResolvedValue(null);

      await expect(service.uploadFile(invalidDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.uploadFile(invalidDto)).rejects.toThrow(
        'File must be a JPEG or PDF',
      );
    });

    it('deve lançar erro se o arquivo for maior que 5MB', async () => {
      const largeFile = { ...mockFile, size: 6 * 1024 * 1024 };
      const invalidDto = { ...uploadDto, file: largeFile };

      fileRepository.getFileByName.mockResolvedValue(null);

      await expect(service.uploadFile(invalidDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.uploadFile(invalidDto)).rejects.toThrow(
        'File must be less than 5MB',
      );
    });

    it('deve lançar erro se o upload falhar', async () => {
      fileRepository.getFileByName.mockResolvedValue(null);
      uploadUseCase.execute.mockResolvedValue(null);

      await expect(service.uploadFile(uploadDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.uploadFile(uploadDto)).rejects.toThrow(
        'Failed to upload file',
      );
    });

    it('deve aceitar arquivo PDF', async () => {
      const pdfFile = { ...mockFile, mimetype: 'application/pdf' };
      const pdfDto = { ...uploadDto, file: pdfFile };

      fileRepository.getFileByName.mockResolvedValue(null);
      uploadUseCase.execute.mockResolvedValue({
        url: 'https://s3.amazonaws.com/test.pdf',
      });
      fileRepository.create.mockResolvedValue({
        id: 1,
        fileName: 'test.pdf',
        fileUrl: 'https://s3.amazonaws.com/test.pdf',
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
      });

      const result = await service.uploadFile(pdfDto);

      expect(result).toHaveProperty('fileName', 'test.pdf');
    });
  });

  describe('getAllFiles', () => {
    it('deve retornar todos os arquivos com paginação', async () => {
      const mockFiles = [
        {
          id: 1,
          fileName: 'test1.jpg',
          fileUrl: 'https://s3.amazonaws.com/test1.jpg',
          created_at: new Date('2024-01-01'),
          updated_at: new Date('2024-01-01'),
        },
        {
          id: 2,
          fileName: 'test2.jpg',
          fileUrl: 'https://s3.amazonaws.com/test2.jpg',
          created_at: new Date('2024-01-02'),
          updated_at: new Date('2024-01-02'),
        },
      ];

      fileRepository.getAllFiles.mockResolvedValue(mockFiles);

      const result = await service.getAllFiles();

      expect(result).toHaveProperty('files');
      expect(result).toHaveProperty('pagination');
      expect(result.files).toHaveLength(2);
      expect(result.pagination.total).toBe(2);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(10);
    });

    it('deve retornar lista vazia quando não houver arquivos', async () => {
      fileRepository.getAllFiles.mockResolvedValue([]);

      const result = await service.getAllFiles();

      expect(result.files).toHaveLength(0);
      expect(result.pagination.total).toBe(0);
    });
  });

  describe('getFileByFileName', () => {
    it('deve retornar arquivo pelo nome', async () => {
      const mockFile = {
        id: 1,
        fileName: 'test.jpg',
        fileUrl: 'https://s3.amazonaws.com/test.jpg',
        created_at: new Date('2024-01-01'),
        updated_at: new Date('2024-01-01'),
      };

      fileRepository.getFileByName.mockResolvedValue(mockFile);

      const result = await service.getFileByFileName('test.jpg');

      expect(fileRepository.getFileByName).toHaveBeenCalledWith('test.jpg');
      expect(result).toHaveProperty('id', 1);
      expect(result).toHaveProperty('fileName', 'test.jpg');
      expect(result).toHaveProperty('fileUrl');
    });

    it('deve lançar erro se arquivo não for encontrado', async () => {
      fileRepository.getFileByName.mockResolvedValue(null);

      await expect(
        service.getFileByFileName('nonexistent.jpg'),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.getFileByFileName('nonexistent.jpg'),
      ).rejects.toThrow('File not found');
    });
  });

  describe('updateFile', () => {
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

    const existingFile = {
      id: 1,
      fileName: 'test.jpg',
      fileUrl: 'https://s3.amazonaws.com/test.jpg',
      created_at: new Date(),
      updated_at: new Date(),
    };

    it('deve atualizar arquivo com sucesso', async () => {
      fileRepository.getFileByName.mockResolvedValue(existingFile);
      uploadUseCase.execute.mockResolvedValue({
        url: 'https://s3.amazonaws.com/test-updated.jpg',
      });
      fileRepository.updateFile.mockResolvedValue({
        ...existingFile,
        fileUrl: 'https://s3.amazonaws.com/test-updated.jpg',
      });

      const result = await service.updateFile('test.jpg', mockFile);

      expect(fileRepository.getFileByName).toHaveBeenCalledWith('test.jpg');
      expect(uploadUseCase.execute).toHaveBeenCalled();
      expect(fileRepository.updateFile).toHaveBeenCalled();
      expect(result).toHaveProperty(
        'fileUrl',
        'https://s3.amazonaws.com/test-updated.jpg',
      );
    });

    it('deve lançar erro se arquivo não existir', async () => {
      fileRepository.getFileByName.mockResolvedValue(null);

      await expect(
        service.updateFile('nonexistent.jpg', mockFile),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.updateFile('nonexistent.jpg', mockFile),
      ).rejects.toThrow('File not found');
    });

    it('deve lançar erro se file não for fornecido', async () => {
      fileRepository.getFileByName.mockResolvedValue(existingFile);

      await expect(service.updateFile('test.jpg', null as any)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.updateFile('test.jpg', null as any)).rejects.toThrow(
        'File is required',
      );
    });

    it('deve lançar erro se arquivo não for JPEG ou PDF', async () => {
      const invalidFile = { ...mockFile, mimetype: 'text/plain' };
      fileRepository.getFileByName.mockResolvedValue(existingFile);

      await expect(service.updateFile('test.jpg', invalidFile)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.updateFile('test.jpg', invalidFile)).rejects.toThrow(
        'File must be a JPEG or PDF',
      );
    });

    it('deve lançar erro se arquivo for maior que 5MB', async () => {
      const largeFile = { ...mockFile, size: 6 * 1024 * 1024 };
      fileRepository.getFileByName.mockResolvedValue(existingFile);

      await expect(service.updateFile('test.jpg', largeFile)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.updateFile('test.jpg', largeFile)).rejects.toThrow(
        'File must be less than 5MB',
      );
    });
  });

  describe('deleteFileByFileName', () => {
    const existingFile = {
      id: 1,
      fileName: 'test.jpg',
      fileUrl: 'https://s3.amazonaws.com/test.jpg',
      created_at: new Date(),
      updated_at: new Date(),
    };

    it('deve deletar arquivo com sucesso', async () => {
      fileRepository.getFileByName.mockResolvedValue(existingFile);
      storageService.deleteFile.mockResolvedValue(undefined);
      fileRepository.deleteFile.mockResolvedValue({
        ...existingFile,
        deleted_at: new Date(),
      });

      const result = await service.deleteFileByFileName('test.jpg');

      expect(fileRepository.getFileByName).toHaveBeenCalledWith('test.jpg');
      expect(storageService.deleteFile).toHaveBeenCalledWith('test.jpg');
      expect(fileRepository.deleteFile).toHaveBeenCalledWith(1);
      expect(result).toHaveProperty('deleted_at');
      expect(result.id).toBe(existingFile.id);
    });

    it('deve lançar erro se arquivo não existir', async () => {
      fileRepository.getFileByName.mockResolvedValue(null);

      await expect(
        service.deleteFileByFileName('nonexistent.jpg'),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.deleteFileByFileName('nonexistent.jpg'),
      ).rejects.toThrow('File not found');
    });

    it('deve lançar erro se a deleção falhar', async () => {
      fileRepository.getFileByName.mockResolvedValue(existingFile);
      storageService.deleteFile.mockResolvedValue(undefined);
      fileRepository.deleteFile.mockResolvedValue(null);

      await expect(service.deleteFileByFileName('test.jpg')).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.deleteFileByFileName('test.jpg')).rejects.toThrow(
        'Failed to delete file',
      );
    });
  });
});
