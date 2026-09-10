/**
 * A routing decision, not a rendered resource: the caller (`apps/web`) makes one further `GET
 * /pages/:id`/`GET /content/:id` call once it knows which type it got.
 */
export type RouteResolution =
  | { type: 'page'; pageId: string }
  | { type: 'content'; contentId: string }
  | { type: 'redirect'; destinationPath: string; statusCode: number };
