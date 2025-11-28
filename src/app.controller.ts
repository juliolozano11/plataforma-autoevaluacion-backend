import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './auth/decorators/public.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get()
  getHello(): { message: string; docs: string; status: string } {
    return {
      message: 'API de Evaluación de Empleabilidad',
      docs: '/api/docs',
      status: 'running',
    };
  }
}
