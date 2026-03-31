import {
  Controller,
  Post,
  Get,
  Param,
  Query,
  Body,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  DefaultValuePipe,
  BadRequestException,
} from '@nestjs/common';
import { JobsService } from './jobs.service';
import { Job } from './job.entity';

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  /**
   * POST /api/jobs/search
   * Semantic search — the core agent endpoint.
   * Body: { query: string, topK?: number, workType?: string, province?: string }
   */
  @Post('search')
  @HttpCode(HttpStatus.OK)
  async search(@Body() body: Record<string, any>): Promise<Job[]> {
    const query = body?.query;
    if (!query || typeof query !== 'string' || !query.trim()) {
      throw new BadRequestException('query must be a non-empty string');
    }
    return this.jobsService.semanticSearch({
      query: query.trim(),
      topK: Number(body?.topK) || 5,
      workType: body?.workType,
      province: body?.province,
    });
  }

  /**
   * GET /api/jobs
   * Paginated listing with optional keyword + work-type filters.
   */
  @Get()
  async list(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('workType') workType?: string,
    @Query('province') province?: string,
    @Query('q') q?: string,
  ): Promise<{ jobs: Job[]; total: number; page: number; limit: number }> {
    const result = await this.jobsService.findAll({ page, limit, workType, province, q });
    return { ...result, page, limit };
  }

  /**
   * GET /api/jobs/:id
   * Deep-link lookup by original_id — fixes the sessionStorage dependency.
   */
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Job> {
    return this.jobsService.findById(id);
  }
}
