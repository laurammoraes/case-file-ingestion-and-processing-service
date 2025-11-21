import { Injectable } from '@nestjs/common';
@Injectable()
export class FileRepository {
  constructor() {}

  async create(filename: string) {
    // return this.prisma.file.create({
    //   data: { filename },
    // });
  }
}