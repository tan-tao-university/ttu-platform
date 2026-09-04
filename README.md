# TTU Platform

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-000000?style=flat-square&logo=nextdotjs&logoColor=white" alt="Next.js 16">
  <img src="https://img.shields.io/badge/NestJS-11-E0234E?style=flat-square&logo=nestjs&logoColor=white" alt="NestJS 11">
  <img src="https://img.shields.io/badge/PostgreSQL-shared-4169E1?style=flat-square&logo=postgresql&logoColor=white" alt="PostgreSQL, shared">
  <img src="https://img.shields.io/badge/MinIO-shared-C72E49?style=flat-square&logo=minio&logoColor=white" alt="MinIO, shared">
  <img src="https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker&logoColor=white" alt="Docker Compose">
  <img src="https://img.shields.io/badge/status-scaffold-lightgrey?style=flat-square" alt="Scaffold — no domain schema yet">
</p>

Replacement for the WordPress site at [ttu.edu.vn](https://ttu.edu.vn) — Tan Tao University's
main public website, its content admin dashboard, and the API behind both.

## Status

This repo is initialized (toolchain, monorepo layout, three bare apps) but has **no content
schema or business logic yet**. The current ttu.edu.vn runs WordPress with a large number of
post types across many categories (Giới thiệu, Tuyển sinh, Đào tạo, Nghiên cứu, Các khoa, Tin
tức & Sự kiện, Vinh danh, Đóng góp, Lịch công tác — see
[docs/content-audit.md](docs/content-audit.md)); the ERD that will replace it has not been
designed yet, so `apps/api` intentionally has no database connection, schema, or auth wired up.
Do not add tables, DTOs, or content modules until that design lands.

## Part of the TTU platform

| Repo                                                                            | Role                                        |
| ------------------------------------------------------------------------------- | ------------------------------------------- |
| [TTU Data Infrastructure](https://github.com/tan-tao-university/ttu-data-infra) | Shared PostgreSQL + MinIO                   |
| [TTU Identity](https://github.com/tan-tao-university/ttu-identity)              | Keycloak — authentication & SSO             |
| [TTU Web Platform](https://github.com/tan-tao-university/ttu-web-platform)      | The 7 faculty sites, their admin, their API |
| **TTU Platform** (this repo)                                                    | ttu.edu.vn, its admin dashboard, its API    |

All four are meant to be checked out as sibling directories on the same host. `ttu-data-infra`
already reserved a `ttu_main` database and `ttu_user` role for this repo — see that repo's
[README](https://github.com/tan-tao-university/ttu-data-infra#databases) — and
`ttu-identity`'s realm reserves the client id `ttu-web` for this app's future admin login. Wire
both up when the schema and auth flow are actually designed, not before.

## Applications

| App                         | Package      | Directory    | Dev port |
| --------------------------- | ------------ | ------------ | -------: |
| Public website (ttu.edu.vn) | `@ttu/web`   | `apps/web`   |     3000 |
| Content admin dashboard     | `@ttu/admin` | `apps/admin` |     3011 |
| Backend API                 | `@ttu/api`   | `apps/api`   |     4001 |

Ports are chosen to not collide with `ttu-web-platform`'s `api.ttu.edu.vn` (4000) and
`admin.ttu.edu.vn` (3010) on the same host. In production every Next.js container listens on
port 3000; Docker host mapping is what separates them (see `compose.production.yml`).

## Requirements

Node 24 LTS (`nvm use`), Bun (install via `curl -fsSL https://bun.sh/install | bash`), Moon
(install via `curl -fsSL https://moonrepo.dev/install/proto.sh | bash && proto install moon`),
Docker (optional, for production-parity builds).

## Stack

Next.js 16 + React 19 + Tailwind 4 (`web`, `admin`), NestJS 11 (`api`), Bun workspaces + Moon.
PostgreSQL, MinIO, and Keycloak are shared infrastructure from the sibling repos above — this
repo does not run its own copies, and does not connect to them yet either (see Status).

## Running

```bash
bun install

bun run dev              # every app in parallel
bun run dev:web          # public site only (:3000)
bun run dev:admin        # admin dashboard only (:3011)
bun run dev:api          # backend API only (:4001)
```

## Checks & Quality Tools

```bash
bun run format:check                        # oxfmt check
bun run lint                                # oxlint + ESLint
bun run duplication                         # jscpd code copy-paste detector
bun run knip                                # dead code & unused dependency detector
moon run :typecheck && moon run :build      # typecheck and production build
moon run api:test                           # NestJS unit tests (Jest)
```

## Layout

```
apps/
  web/      Public website — Next.js 16, empty homepage, no content model yet
  admin/    Content admin dashboard — Next.js 16, no auth wired up yet
  api/      Backend API — NestJS 11, bare bootstrap, no database or auth yet
infrastructure/  Dockerfiles for production builds
docs/            Setup guide and the WordPress content audit informing the future ERD
```

## Deployment notes

- Nginx runs directly on the Ubuntu server and is **not part of this repo**. The repo only
  exposes container ports.
- Real env files live on the server (`env/production/{api,site}.env`); Git only holds
  `apps/*/.env.example`.
- `compose.production.yml` joins the shared `ttu-backend` Docker network that `ttu-data-infra`
  owns — nothing in this repo owns or starts Postgres/MinIO/Keycloak itself.
