import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../../access/decorators/current-user.decorator';
import { RequirePermission } from '../../access/decorators/require-permission.decorator';
import { JwtAuthGuard } from '../../access/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../access/guards/permissions.guard';
import type { AuthenticatedUser } from '../../access/access.types';
import { paginationMeta } from '../../common/dto/pagination-query.dto';
import { CreateRedirectDto } from '../dto/create-redirect.dto';
import { RedirectListQueryDto } from '../dto/redirect-list-query.dto';
import { UpdateRedirectDto } from '../dto/update-redirect.dto';
import { RedirectsService } from '../services/redirects.service';

/**
 * Admin-only management surface (design doc 06 §5.2): unlike `content`/`menus`, `redirects` has no
 * public-read concept of its own - resolving an incoming request against `public_routes` then
 * `redirects` (doc 05 §12.1's locale -> global -> 404 order) is the public routing layer's job, not
 * a JSON resource here.
 */
@Controller('redirects')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@RequirePermission('redirect.manage')
export class RedirectsController {
  constructor(private readonly redirects: RedirectsService) {}

  @Get()
  async list(@Query() query: RedirectListQueryDto) {
    const { items, total } = await this.redirects.list(query);
    return { items, ...paginationMeta(query.page, query.pageSize, total) };
  }

  @Get(':id')
  async get(@Param('id', ParseUUIDPipe) id: string) {
    return this.redirects.findById(id);
  }

  @Post()
  async create(@Body() dto: CreateRedirectDto, @CurrentUser() user: AuthenticatedUser) {
    return this.redirects.create(dto, user.id);
  }

  @Patch(':id')
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateRedirectDto) {
    return this.redirects.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.redirects.remove(id);
  }
}
