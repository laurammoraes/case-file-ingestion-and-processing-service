import { Controller, Get } from '@nestjs/common';
import { AppService } from '../../domain/services/app.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Health Check')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @ApiOperation({ summary: 'Get API status' })
  @ApiResponse({ status: 200, description: 'API is running' })
  @Get('/status')
  async getStatus(): Promise<string> {
    return 'API is running';
  }
}
