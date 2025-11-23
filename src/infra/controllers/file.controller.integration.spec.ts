import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { FilesModule } from '../modules/file.module';
import { DatabaseModule } from '../database/database.module';
import { StorageService } from '../tools/storage.service';
import { ParametersService } from '../tools/parameters.service';
import { PgService } from '../database/pg.service';

describe('FilesController (Integration)', () => {
  let app: INestApplication;

  const mockStorageService = {
    uploadFile: jest.fn(),
    getFileUrl: jest.fn(),
    deleteFile: jest.fn(),
  };

  const mockParametersService = {
    AWS_REGION: 'us-east-1',
    AWS_ACCESS_KEY_ID: 'test-key',
    AWS_SECRET_ACCESS_KEY: 'test-secret',
    PG_DATABASE_URL:
      process.env.PG_DATABASE_URL ||
      'postgresql://test:test@localhost:5432/test',
  };

  const mockPgService = {
    files: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn((callback: any) => {
      return callback(mockPgService);
    }),
    $connect: jest.fn(),
    $disconnect: jest.fn(),
  };

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    if (!process.env.PG_DATABASE_URL) {
      process.env.PG_DATABASE_URL =
        'postgresql://test:test@localhost:5432/test';
    }

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [FilesModule, DatabaseModule],
    })
      .overrideProvider(StorageService)
      .useValue(mockStorageService)
      .overrideProvider(ParametersService)
      .useValue(mockParametersService)
      .overrideProvider(PgService)
      .useValue(mockPgService)
      .compile();

    app = moduleFixture.createNestApplication();

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();

    mockPgService.files.findMany.mockResolvedValue([]);
    mockPgService.files.findFirst.mockResolvedValue(null);
    mockPgService.files.create.mockResolvedValue({
      id: 1,
      fileName: 'test.jpg',
      fileUrl: 'https://s3.amazonaws.com/test.jpg',
      created_at: new Date(),
      updated_at: new Date(),
      deleted_at: null,
    });
    mockPgService.files.update.mockResolvedValue({
      id: 1,
      fileName: 'test.jpg',
      fileUrl: 'https://s3.amazonaws.com/test.jpg',
      created_at: new Date(),
      updated_at: new Date(),
      deleted_at: new Date(),
    });
  });

  describe('POST /files', () => {
    it('deve retornar 400 se arquivo não for fornecido', async () => {
      return request(app.getHttpServer())
        .post('/files')
        .field('filename', 'test.jpg')
        .expect(400);
    });

    it('deve usar originalname quando filename não for fornecido', async () => {
      const mockFileUrl = 'https://s3.amazonaws.com/files/test.jpg/test.jpg';
      mockStorageService.uploadFile.mockResolvedValue(mockFileUrl);

      mockPgService.files.findFirst.mockResolvedValueOnce(null);

      mockPgService.files.create.mockResolvedValueOnce({
        id: 1,
        fileName: 'test.jpg',
        fileUrl: mockFileUrl,
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
      });

      const response = await request(app.getHttpServer())
        .post('/files')
        .attach('file', Buffer.from('test'), 'test.jpg')
        .expect(201);

      expect(response.body).toHaveProperty('fileName', 'test.jpg');
    });

    it('deve fazer upload de arquivo JPEG com sucesso', async () => {
      const mockFileUrl = 'https://s3.amazonaws.com/files/test.jpg/test.jpg';
      mockStorageService.uploadFile.mockResolvedValue(mockFileUrl);

      mockPgService.files.findFirst.mockResolvedValueOnce(null);

      mockPgService.files.create.mockResolvedValueOnce({
        id: 1,
        fileName: 'test.jpg',
        fileUrl: mockFileUrl,
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
      });

      const response = await request(app.getHttpServer())
        .post('/files')
        .field('filename', 'test.jpg')
        .attach('file', Buffer.from('fake jpeg content'), 'test.jpg')
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('fileName', 'test.jpg');
      expect(response.body).toHaveProperty('fileUrl', mockFileUrl);
    });

    it('deve fazer upload de arquivo PDF com sucesso', async () => {
      const mockFileUrl = 'https://s3.amazonaws.com/files/test.pdf/test.pdf';
      mockStorageService.uploadFile.mockResolvedValue(mockFileUrl);


      mockPgService.files.findFirst.mockResolvedValueOnce(null);

      mockPgService.files.create.mockResolvedValueOnce({
        id: 2,
        fileName: 'test.pdf',
        fileUrl: mockFileUrl,
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
      });

      const response = await request(app.getHttpServer())
        .post('/files')
        .field('filename', 'test.pdf')
        .attach('file', Buffer.from('%PDF-1.4 fake pdf content'), 'test.pdf')
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('fileName', 'test.pdf');
    });

    it('deve retornar 400 se tentar fazer upload de arquivo com nome duplicado', async () => {
      const mockFileUrl = 'https://s3.amazonaws.com/files/test.jpg/test.jpg';
      mockStorageService.uploadFile.mockResolvedValue(mockFileUrl);

      mockPgService.files.findFirst.mockResolvedValueOnce(null);
      mockPgService.files.create.mockResolvedValueOnce({
        id: 1,
        fileName: 'duplicate.jpg',
        fileUrl: mockFileUrl,
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
      });

      await request(app.getHttpServer())
        .post('/files')
        .field('filename', 'duplicate.jpg')
        .attach('file', Buffer.from('fake jpeg content'), 'duplicate.jpg')
        .expect(201);

      mockPgService.files.findFirst.mockResolvedValueOnce({
        id: 1,
        fileName: 'duplicate.jpg',
        fileUrl: mockFileUrl,
        created_at: new Date(),
        updated_at: new Date(),
      });

      await request(app.getHttpServer())
        .post('/files')
        .field('filename', 'duplicate.jpg')
        .attach('file', Buffer.from('fake jpeg content'), 'duplicate.jpg')
        .expect(400);
    });
  });

  describe('GET /files', () => {
    it('deve retornar lista de arquivos com paginação', async () => {
      const mockFiles = [
        {
          id: 1,
          fileName: 'test1.jpg',
          fileUrl: 'https://s3.amazonaws.com/test1.jpg',
          created_at: new Date('2024-01-01'),
          updated_at: new Date('2024-01-01'),
        },
      ];

      mockPgService.files.findMany.mockResolvedValueOnce(mockFiles);

      const response = await request(app.getHttpServer())
        .get('/files')
        .expect(200);

      expect(response.body).toHaveProperty('files');
      expect(response.body).toHaveProperty('pagination');
      expect(response.body.pagination).toHaveProperty('total');
      expect(response.body.pagination).toHaveProperty('page', 1);
      expect(response.body.pagination).toHaveProperty('limit', 10);
      expect(Array.isArray(response.body.files)).toBe(true);
    });
  });

  describe('GET /files/fileName', () => {
    it('deve retornar arquivo pelo nome', async () => {

      const mockFileUrl =
        'https://s3.amazonaws.com/files/gettest.jpg/gettest.jpg';
      mockStorageService.uploadFile.mockResolvedValue(mockFileUrl);

      const mockFile = {
        id: 1,
        fileName: 'gettest.jpg',
        fileUrl: mockFileUrl,
        created_at: new Date('2024-01-01'),
        updated_at: new Date('2024-01-01'),
      };

      mockPgService.files.findFirst.mockResolvedValueOnce(null);

      mockPgService.files.create.mockResolvedValueOnce({
        ...mockFile,
        deleted_at: null,
      });

      const uploadResponse = await request(app.getHttpServer())
        .post('/files')
        .field('filename', 'gettest.jpg')
        .attach('file', Buffer.from('fake jpeg content'), 'gettest.jpg')
        .expect(201);

      const fileName = uploadResponse.body.fileName;


      mockPgService.files.findFirst.mockResolvedValueOnce(mockFile);

      const response = await request(app.getHttpServer())
        .get(`/files/fileName?name=${fileName}`)
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('fileName', fileName);
      expect(response.body).toHaveProperty('fileUrl');
    });

    it('deve retornar 400 se arquivo não for encontrado', async () => {
      return request(app.getHttpServer())
        .get('/files/fileName?name=nonexistent.jpg')
        .expect(400);
    });
  });

  describe('PUT /files/fileName', () => {
    it('deve atualizar arquivo com sucesso', async () => {

      const mockFileUrl =
        'https://s3.amazonaws.com/files/updatetest.jpg/updatetest.jpg';
      mockStorageService.uploadFile.mockResolvedValue(mockFileUrl);

      const existingFile = {
        id: 1,
        fileName: 'updatetest.jpg',
        fileUrl: mockFileUrl,
        created_at: new Date('2024-01-01'),
        updated_at: new Date('2024-01-01'),
      };

      mockPgService.files.findFirst.mockResolvedValueOnce(null);

      mockPgService.files.create.mockResolvedValueOnce({
        ...existingFile,
        deleted_at: null,
      });

      const uploadResponse = await request(app.getHttpServer())
        .post('/files')
        .field('filename', 'updatetest.jpg')
        .attach('file', Buffer.from('fake jpeg content'), 'updatetest.jpg')
        .expect(201);

      const fileName = uploadResponse.body.fileName;

      const updatedFileUrl =
        'https://s3.amazonaws.com/files/updatetest.jpg.updated/updatetest.jpg.updated';
      mockStorageService.uploadFile.mockResolvedValue(updatedFileUrl);

      mockPgService.files.findFirst.mockResolvedValueOnce(existingFile);

      mockPgService.files.update.mockResolvedValueOnce({
        ...existingFile,
        fileUrl: updatedFileUrl,
        updated_at: new Date(),
      });

      const response = await request(app.getHttpServer())
        .put(`/files/fileName?name=${fileName}`)
        .field('filename', fileName)
        .attach('file', Buffer.from('updated jpeg content'), 'updatetest.jpg')
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('fileName', fileName);
    });

    it('deve retornar 400 se arquivo não existir', async () => {
      return request(app.getHttpServer())
        .put('/files/fileName?name=nonexistent.jpg')
        .field('filename', 'nonexistent.jpg')
        .attach('file', Buffer.from('fake jpeg content'), 'nonexistent.jpg')
        .expect(400);
    });
  });

  describe('DELETE /files/:name', () => {
    it('deve deletar arquivo com sucesso', async () => {
      const mockFileUrl =
        'https://s3.amazonaws.com/files/deletetest.jpg/deletetest.jpg';
      mockStorageService.uploadFile.mockResolvedValue(mockFileUrl);
      mockStorageService.deleteFile.mockResolvedValue(undefined);

      const existingFile = {
        id: 1,
        fileName: 'deletetest.jpg',
        fileUrl: mockFileUrl,
        created_at: new Date('2024-01-01'),
        updated_at: new Date('2024-01-01'),
      };

      mockPgService.files.findFirst.mockResolvedValueOnce(null);

      mockPgService.files.create.mockResolvedValueOnce({
        ...existingFile,
        deleted_at: null,
      });

      const uploadResponse = await request(app.getHttpServer())
        .post('/files')
        .field('filename', 'deletetest.jpg')
        .attach('file', Buffer.from('fake jpeg content'), 'deletetest.jpg')
        .expect(201);

      const fileName = uploadResponse.body.fileName;

      mockPgService.files.findFirst.mockResolvedValueOnce(existingFile);

      mockPgService.files.update.mockResolvedValueOnce({
        ...existingFile,
        deleted_at: new Date(),
      });

      const response = await request(app.getHttpServer())
        .delete(`/files/${fileName}`)
        .expect(200);

      expect(response.body).toHaveProperty('deleted_at');
      expect(mockStorageService.deleteFile).toHaveBeenCalled();
    });

    it('deve retornar 400 se arquivo não existir', async () => {
      return request(app.getHttpServer())
        .delete('/files/nonexistent.jpg')
        .expect(400);
    });
  });
});
