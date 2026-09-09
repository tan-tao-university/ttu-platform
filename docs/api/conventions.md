# API: Conventions & Standards

## 1. URL Namespaces & Versioning

All API routes are served under the `/api/v1/` prefix and cleanly partitioned by consumer audience:

- `/api/v1/public/*`: Read-only endpoints for `ttu.edu.vn`. Serves strictly published revisions. No authentication required.
- `/api/v1/admin/*`: Management endpoints for `admin.ttu.edu.vn`. Requires valid Keycloak JWT Bearer token and checks granular permissions.
- `/api/v1/integrations/*`: Machine-to-machine endpoints for sibling platforms (e.g. `ttu-faculty-platform`).

## 2. Standardized Error Response Envelope

All error responses implement a RFC 7807 (ProblemDetails)-inspired envelope via `AllExceptionsFilter` and `ApiError`:

```json
{
  "statusCode": 422,
  "error": "Unprocessable Entity",
  "message": "Validation failed",
  "errors": [
    {
      "field": "slug",
      "message": "slug must be lowercase, hyphen-separated"
    },
    {
      "field": "path",
      "message": "path must start with \"/\" and contain no query string or hash"
    }
  ]
}
```

## 3. HTTP Status Codes

| Code | Meaning | Typical Usage |
| :-: | :-- | :-- |
| `200` | OK | Successful fetch, update, or action |
| `201` | Created | Successful entity creation |
| `400` | Bad Request | Malformed payload or unparseable query parameters |
| `401` | Unauthorized | Missing or expired Keycloak JWT Bearer token |
| `403` | Forbidden | Authenticated user lacks required permission code |
| `404` | Not Found | Requested entity or route does not exist |
| `409` | Conflict | Duplicate unique key, active slug collision, or concurrency conflict |
| `422` | Unprocessable Entity | DTO field validation failure or business invariant violation |
| `500` | Internal Server Error | Unexpected server failure; sensitive stack traces are suppressed |

## 4. Pagination & Filtering Standards

All list endpoints support standard pagination queries (`page`, `pageSize`) returning metadata:

```json
{
  "items": [],
  "page": 1,
  "pageSize": 20,
  "total": 125,
  "totalPages": 7
}
```
