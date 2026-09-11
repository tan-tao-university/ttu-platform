import { Controller, Get, Query } from '@nestjs/common';
import { ResolveRouteQueryDto } from '../dto/resolve-route-query.dto';
import { RouteResolutionService } from '../services/route-resolution.service';

/**
 * Public, unauthenticated - `apps/web` calls this once per incoming request to decide whether a
 * path is a live Page, live Content, an old URL that should redirect, or a genuine `404`, before
 * making the one further Pages/Content by-id call the result points it to (design doc 05 §12.1, doc
 * 06 §9).
 */
@Controller('routes')
export class RoutingController {
  constructor(private readonly resolution: RouteResolutionService) {}

  @Get('resolve')
  async resolve(@Query() query: ResolveRouteQueryDto) {
    return this.resolution.resolve(query.locale, query.path);
  }
}
