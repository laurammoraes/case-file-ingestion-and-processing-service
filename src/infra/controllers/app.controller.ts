import { Controller, Get } from '@nestjs/common';
import { AppService } from '../../domain/services/app.service';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @ApiOperation({ summary: 'Get hello world' })
  @ApiResponse({ status: 200, description: 'Hello World' })
  @Get()
  async getHello(): Promise<string> {
    return await this.appService.getHello();
  }
}
