import { UploadFileDto } from '../../infra/dtos/uploadFile.dto';

export class FileEntity {
  id: number;
  fileName: string;
  fileUrl: string;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;

  constructor(file: {
    id: number;
    fileName: string;
    fileUrl: string;
    created_at: Date;
    updated_at: Date;
    deleted_at: Date | null;
  }) {
    this.id = file.id;
    this.fileName = file.fileName;
    this.fileUrl = file.fileUrl;
  }

  errors: string[] = [];

  validate(uploadDto: UploadFileDto) {
    this.errors = [];

    if (!uploadDto) {
      this.errors.push('File is required');
      return this;
    }

    if (!uploadDto.filename) {
      this.errors.push('File name is required');
    }

    if (!uploadDto.file) {
      this.errors.push('File is required');
      return this;
    }

    if (uploadDto.file.size > 1024 * 1024 * 5) {
      this.errors.push('File must be less than 5MB');
    }

    if (
      !uploadDto.file.mimetype.includes('image/jpeg') &&
      !uploadDto.file.mimetype.includes('application/pdf')
    ) {
      this.errors.push('File must be a JPEG or PDF');
    }

    return this;
  }
}
