import { Test, TestingModule } from '@nestjs/testing';
import { FileRepository } from './file.repositories';
import { PgService } from 'src/infra/database/pg.service';

describe('FileRepository', () => {
  let repository: FileRepository;
  let pgService: jest.Mocked<PgService>;

  const mockPgService = {
    files: {
      create: jest.fn() as jest.Mock,
      findMany: jest.fn() as jest.Mock,
      findFirst: jest.fn() as jest.Mock,
      update: jest.fn() as jest.Mock,
    },
    $transaction: jest.fn(),
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FileRepository,
        {
          provide: PgService,
          useValue: mockPgService,
        },
      ],
    }).compile();

    repository = module.get<FileRepository>(FileRepository);
    pgService = module.get(PgService) as any;

    jest.clearAllMocks();
  });

  describe('create', () => {
    it('deve criar arquivo com sucesso', async () => {
      const fileData = {
        fileName: 'test.jpg',
        fileUrl: 'https://s3.amazonaws.com/test.jpg',
      };

      const expectedResult = {
        id: 1,
        fileName: 'test.jpg',
        fileUrl: 'https://s3.amazonaws.com/test.jpg',
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
      };

      const mockTransaction = {
        files: {
          create: jest.fn().mockResolvedValue(expectedResult),
        },
      };

      pgService.$transaction.mockImplementation(async (callback: any) => {
        return await callback(mockTransaction);
      });

      const result = await repository.create(fileData);

      expect(pgService.$transaction).toHaveBeenCalled();
      expect(mockTransaction.files.create).toHaveBeenCalledWith({
        data: {
          fileName: 'test.jpg',
          fileUrl: 'https://s3.amazonaws.com/test.jpg',
          created_at: expect.any(Date),
          updated_at: expect.any(Date),
          deleted_at: null,
        },
      });
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getAllFiles', () => {
    it('deve retornar todos os arquivos não deletados', async () => {
      const expectedFiles = [
        {
          id: 1,
          fileName: 'test1.jpg',
          fileUrl: 'https://s3.amazonaws.com/test1.jpg',
          created_at: new Date('2024-01-01'),
          updated_at: new Date('2024-01-01'),
          deleted_at: null,
        },
        {
          id: 2,
          fileName: 'test2.jpg',
          fileUrl: 'https://s3.amazonaws.com/test2.jpg',
          created_at: new Date('2024-01-02'),
          updated_at: new Date('2024-01-02'),
          deleted_at: null,
        },
      ];

      (pgService.files.findMany as jest.Mock).mockResolvedValue(expectedFiles);

      const result = await repository.getAllFiles();

      expect(pgService.files.findMany).toHaveBeenCalledWith({
        where: {
          deleted_at: null,
        },
        select: {
          id: true,
          fileName: true,
          fileUrl: true,
          created_at: true,
          updated_at: true,
        },
        orderBy: {
          created_at: 'desc',
        },
      });
      expect(result).toEqual(expectedFiles);
    });

    it('deve retornar array vazio quando não houver arquivos', async () => {
      (pgService.files.findMany as jest.Mock).mockResolvedValue([]);

      const result = await repository.getAllFiles();

      expect(result).toEqual([]);
    });
  });

  describe('getFileByName', () => {
    it('deve retornar arquivo pelo nome', async () => {
      const expectedFile = {
        id: 1,
        fileName: 'test.jpg',
        fileUrl: 'https://s3.amazonaws.com/test.jpg',
        created_at: new Date('2024-01-01'),
        updated_at: new Date('2024-01-01'),
        deleted_at: null,
      };

      (pgService.files.findFirst as jest.Mock).mockResolvedValue(expectedFile);

      const result = await repository.getFileByName('test.jpg');

      expect(pgService.files.findFirst).toHaveBeenCalledWith({
        where: {
          fileName: 'test.jpg',
          deleted_at: null,
        },
        select: {
          id: true,
          fileName: true,
          fileUrl: true,
          created_at: true,
          updated_at: true,
        },
      });
      expect(result).toEqual(expectedFile);
    });

    it('deve retornar null quando arquivo não for encontrado', async () => {
      (pgService.files.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await repository.getFileByName('nonexistent.jpg');

      expect(result).toBeNull();
    });
  });

  describe('updateFile', () => {
    it('deve atualizar arquivo com sucesso', async () => {
      const fileData = {
        fileName: 'test-updated.jpg',
        fileUrl: 'https://s3.amazonaws.com/test-updated.jpg',
      };

      const expectedResult = {
        id: 1,
        fileName: 'test-updated.jpg',
        fileUrl: 'https://s3.amazonaws.com/test-updated.jpg',
        created_at: new Date('2024-01-01'),
        updated_at: new Date(),
      };

      (pgService.files.update as jest.Mock).mockResolvedValue(expectedResult);

      const result = await repository.updateFile(1, fileData);

      expect(pgService.files.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          fileName: 'test-updated.jpg',
          fileUrl: 'https://s3.amazonaws.com/test-updated.jpg',
          updated_at: expect.any(Date),
        },
      });
      expect(result).toEqual(expectedResult);
    });
  });

  describe('deleteFile', () => {
    it('deve fazer soft delete do arquivo', async () => {
      const expectedResult = {
        id: 1,
        fileName: 'test.jpg',
        fileUrl: 'https://s3.amazonaws.com/test.jpg',
        created_at: new Date('2024-01-01'),
        updated_at: new Date('2024-01-01'),
        deleted_at: new Date(),
      };

      (pgService.files.update as jest.Mock).mockResolvedValue(expectedResult);

      const result = await repository.deleteFile(1);

      expect(pgService.files.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          deleted_at: expect.any(Date),
        },
      });
      expect(result).toEqual(expectedResult);
    });
  });
});
