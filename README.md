<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/tan-tao-university/ttu-platform">
    <img src="assets/logo-ttu.png" alt="Tan Tao University Logo" width="100">
  </a>

  <h1 align="center">TTU Platform</h1>

  <p align="center">
    <a href="https://nextjs.org/"><img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js" /></a>
    <a href="https://react.dev/"><img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" /></a>
    <a href="https://tailwindcss.com/"><img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" /></a>
    <a href="https://nestjs.com/"><img src="https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" alt="NestJS" /></a>
    <a href="https://www.postgresql.org/"><img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" /></a>
    <a href="https://orm.drizzle.team/"><img src="https://img.shields.io/badge/Drizzle_ORM-C5F74F?style=for-the-badge&logo=drizzle&logoColor=black" alt="Drizzle ORM" /></a>
    <a href="https://www.keycloak.org/"><img src="https://img.shields.io/badge/Keycloak-008080?style=for-the-badge&logo=keycloak&logoColor=white" alt="Keycloak" /></a>
    <a href="https://bun.sh/"><img src="https://img.shields.io/badge/Bun-000000?style=for-the-badge&logo=bun&logoColor=white" alt="Bun" /></a>
    <a href="https://moonrepo.dev/"><img src="https://img.shields.io/badge/Moonrepo-5046E5?style=for-the-badge&logo=moonrepo&logoColor=white" alt="Moonrepo" /></a>
    <a href="https://www.docker.com/"><img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" /></a>
  </p>
  <p align="center">
    Official digital portal and unified web platform for <strong>Tan Tao University</strong> (<a href="https://ttu.edu.vn">ttu.edu.vn</a>).
    <br />
    Architected as a high-performance monorepo integrating the public university website, content management dashboard, and enterprise REST API with Keycloak SSO.
    <br />
    <br />
    <a href="docs/setup.md"><strong>Explore the setup guide »</strong></a>
    &middot;
    <a href="IMPLEMENTATION_STATUS.md">Implementation Status</a>
    &middot;
    <a href="https://github.com/tan-tao-university/ttu-platform/issues/new?labels=bug">Report Bug</a>
    &middot;
    <a href="https://github.com/tan-tao-university/ttu-platform/issues/new?labels=enhancement">Request Feature</a>
  </p>
</div>

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#ttu-ecosystem">TTU Ecosystem</a></li>
        <li><a href="#monorepo-applications">Monorepo Applications</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
        <li><a href="#environment-configuration">Environment Configuration</a></li>
      </ul>
    </li>
    <li>
      <a href="#usage">Usage</a>
      <ul>
        <li><a href="#development-servers">Development Servers</a></li>
        <li><a href="#database-scripts">Database Scripts</a></li>
        <li><a href="#quality-gates--testing">Quality Gates & Testing</a></li>
      </ul>
    </li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
    <li><a href="#acknowledgments">Acknowledgments</a></li>
  </ol>
</details>

<!-- ABOUT THE PROJECT -->

## About The Project

`ttu-platform` is the core digital platform powering Tan Tao University's official online presence at [ttu.edu.vn](https://ttu.edu.vn). Designed for scalability, security, and multilingual content delivery, the platform brings together modern frontend engineering and a robust backend to serve prospective students, current students, faculty, alumni, and administrative staff through three specialized applications: a high-speed public web portal, an editorial management dashboard, and a centralized NestJS REST API with PostgreSQL persistence and Keycloak Single Sign-On (SSO).

### TTU Ecosystem

This repository is one of four sibling repositories designed to be cloned alongside each other in development and containerized together in production:

| Repository | Role | Technology Stack |
| :-- | :-- | :-- |
| [**ttu-data-infra**][ttu-data-infra-url] | Shared database and object storage | PostgreSQL 16 (`ttu_main`), MinIO |
| [**ttu-identity**][ttu-identity-url] | Authentication, Single Sign-On (SSO) & IDP | Keycloak 26, OpenID Connect (`ttu` realm) |
| [**ttu-faculty-platform**][ttu-faculty-platform-url] | Seven distinct faculty portals & admin APIs | Multi-tenant faculty portals (`*.ttu.edu.vn`) |
| [**ttu-platform**][ttu-platform-url] _(this repo)_ | Main university portal, CMS dashboard & API | Next.js 16 (`web`, `admin`), NestJS 11 (`api`) |

### Monorepo Applications

| Application | Package Name | Directory | Default Port | Description |
| :-- | :-- | :-- | :-: | :-- |
| **Public Website** | `@ttu/web` | `apps/web` | `3000` | Fast, accessible university public website for prospective students, faculty, and public visitors. |
| **Admin Dashboard** | `@ttu/admin` | `apps/admin` | `3011` | Content management, editorial workflow, and administrative portal for university staff. |
| **Core API** | `@ttu/api` | `apps/api` | `4001` | High-throughput NestJS API handling authentication, content management, taxonomy, and system services. |

_Note: Dev ports (3000, 3011, 4001) are selected to avoid collisions with `ttu-faculty-platform` on the same host (3010, 4000). In production, each app runs in its own Docker container joining the shared `ttu-backend` network._

<!-- GETTING STARTED -->

## Getting Started

Follow these instructions to set up `ttu-platform` locally on your development machine.

### Prerequisites

Ensure you have the following toolchain installed:

- **Node.js**: Version 24 LTS
  ```sh
  nvm use 24
  ```
- **Bun**: Version 1.4+
  ```sh
  curl -fsSL https://bun.sh/install | bash
  ```
- **Proto & Moon**: Toolchain manager and monorepo build system
  ```sh
  curl -fsSL https://moonrepo.dev/install/proto.sh | bash
  proto install moon
  ```
- **Docker & Docker Compose**: For running shared infrastructure services (`ttu-data-infra` and `ttu-identity`).

### Installation

1. Clone the repository and navigate to the project root:
   ```sh
   git clone https://github.com/tan-tao-university/ttu-platform.git
   cd ttu-platform
   ```
2. Install workspace dependencies:
   ```sh
   bun install
   ```
3. Prepare Git hooks (Lefthook + Commitlint):
   ```sh
   bun run prepare
   ```

### Environment Configuration

`apps/api` requires environment variables pointing to `ttu_main` PostgreSQL database and Keycloak instance.

1. Copy the example configuration file:
   ```sh
   cp apps/api/.env.example apps/api/.env
   ```
2. Adjust environment values in `apps/api/.env` if your local database credentials differ:
   ```env
   DATABASE_URL=postgres://ttu_user:ttu_password@localhost:5432/ttu_main
   KEYCLOAK_ISSUER_URL=http://localhost:8080/realms/ttu
   KEYCLOAK_CLIENT_ID=ttu-web
   ```
3. Run the database seed to initialize permissions and default roles:
   ```sh
   bun run --cwd apps/api db:seed
   ```
4. Bootstrap an initial super admin user (maps your Keycloak user UUID):
   ```sh
   bun run --cwd apps/api db:create-super-admin <your-keycloak-user-uuid> <your-email> "Admin Name"
   ```

<!-- USAGE EXAMPLES -->

## Usage

### Development Servers

You can run all three applications concurrently or work on a single surface:

```sh
bun run dev              # Run web, admin, and api concurrently in parallel
bun run dev:web          # Start public website only (http://localhost:3000)
bun run dev:admin        # Start admin dashboard only (http://localhost:3011)
bun run dev:api          # Start NestJS backend API only (http://localhost:4001)
```

### Database Scripts

Manage PostgreSQL schema migrations and data seeding via Drizzle ORM:

```sh
bun run --cwd apps/api db:generate           # Generate new Drizzle SQL migration from schema diff
bun run --cwd apps/api db:migrate            # Apply pending migrations to PostgreSQL database
bun run --cwd apps/api db:studio             # Open Drizzle Studio web interface
bun run --cwd apps/api db:seed               # Seed permission catalog and baseline roles
```

### Quality Gates & Testing

Before creating a commit or opening a pull request, all automated quality checks must pass:

```sh
bun run format:check                         # Oxfmt formatting check (proseWrap: never, jsdoc: true)
bun run lint                                 # Oxlint and ESLint validation (including JSDoc plugin)
bun run duplication                          # JSCPD duplicate code detector (threshold < 3%)
bun run knip                                 # Dead code and unused dependency analysis
moon run :typecheck                          # Strict TypeScript typechecking across all 3 apps
moon run api:test                            # NestJS unit tests in apps/api/test/
moon run :build                              # Production build for Next.js apps and NestJS API
```

<!-- ROADMAP -->

## Roadmap

Track our completed milestones and upcoming domains. For exhaustive technical progress, see the master [Implementation Status](IMPLEMENTATION_STATUS.md) and its domain trackers: [Backend API](apps/api/IMPLEMENTATION_STATUS.md), [Admin Dashboard](apps/admin/IMPLEMENTATION_STATUS.md), and [Public Website](apps/web/IMPLEMENTATION_STATUS.md).

- [x] **Phase 1: Foundation & Database**
  - [x] 36-table physical database schema for `ttu_main` (Drizzle ORM)
  - [x] Database infrastructure and connection pooling
  - [x] Database schema alignment with official design specifications
- [x] **Phase 2: Access & Identity**
  - [x] Keycloak JWT verification guard (`JwtAuthGuard`) via JWKS
  - [x] Local RBAC permissions guard (`PermissionsGuard` & `@RequirePermission`)
  - [x] Just-In-Time (JIT) user synchronization and `GET /api/v1/me`
- [x] **Phase 3: Content Domain & Taxonomy**
  - [x] Hierarchical categories and tags with per-locale translations
  - [x] Multi-type editorial content items (News, Announcements, Press Releases, Articles, Events)
  - [x] Content revision history, snapshot immutability, publish lifecycle, and rollback transaction
  - [x] Public route resolution and automatic 301 redirect generation
- [ ] **Phase 4: Media & Storage**
  - [ ] MinIO S3-compatible object upload and asset metadata management
  - [ ] Media translation and responsive variant generation
- [ ] **Phase 5: CMS Page Builder**
  - [x] Component Registry package (`packages/cms-registry`) — engine + Level A style tokens; only `hero` v1 registered
  - [x] Dynamic section drafting and published revision snapshots — `apps/api/src/cms/` (Page/Section/Publish/Rollback API)
- [ ] **Phase 6: Frontend Applications**
  - [ ] Admin dashboard authentication flow (OIDC redirect)
  - [ ] Admin content and taxonomy management UI
  - [ ] Public website UI components and responsive layout

<!-- CONTRIBUTING -->

## Contributing

Contributions make the software engineering community an inspiring place to learn, build, and innovate. Any contributions you make are **greatly appreciated**.

If you have suggestions or bug reports:

1. Fork the Project.
2. Create your Feature Branch:
   ```sh
   git checkout -b feat/amazing-feature
   ```
   _(Branch names must follow `<type>/<kebab-case-slug>` format per `commitlint.config.mjs`)_
3. Commit your Changes with Conventional Commits:
   ```sh
   git commit -m "feat(content): add scheduled publishing job"
   ```
4. Push to the Branch:
   ```sh
   git push origin feat/amazing-feature
   ```
5. Open a Pull Request against `main`.

### Code & Documentation Standards

- **Markdown Prose**: Never hard-wrap markdown prose mid-sentence. One paragraph or list item is one continuous line, formatted automatically with `oxfmt` (`proseWrap: "never"`).
- **Code Comments**: All documentation comments must use standard JSDoc (`/** ... */`). No divider lines, no conversational monologue, comments strictly explain _why_.
- **Test Placement**: All test files for `apps/api` must be located inside `apps/api/test/`, never colocated in `src/`.

<!-- LICENSE -->

## License

Distributed under private university licensing. Copyright &copy; Tan Tao University. All rights reserved.

<!-- CONTACT -->

## Contact

**Tan Tao University** — Tan Tao University Avenue, Tan Duc E.City, Duc Hoa, Long An, Vietnam

- **Website**: [https://ttu.edu.vn](https://ttu.edu.vn)
- **Project Repository**: [https://github.com/tan-tao-university/ttu-platform](https://github.com/tan-tao-university/ttu-platform)
- **Email**: [info@ttu.edu.vn](mailto:info@ttu.edu.vn)

<!-- ACKNOWLEDGMENTS -->

## Acknowledgments

Special thanks to the open-source tools and resources powering TTU Platform:

- [Next.js Documentation](https://nextjs.org/docs)
- [NestJS Documentation](https://docs.nestjs.com/)
- [Drizzle ORM](https://orm.drizzle.team/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [Keycloak Documentation](https://www.keycloak.org/documentation)
- [Moonrepo](https://moonrepo.dev/)
- [Bun Runtime](https://bun.sh/)
- [Best-README-Template by othneildrew](https://github.com/othneildrew/Best-README-Template)
- [Shields.io](https://shields.io)

<!-- MARKDOWN LINKS & IMAGES -->

[Next.js]: https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white
[Next-url]: https://nextjs.org/
[React.js]: https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB
[React-url]: https://react.dev/
[TailwindCSS]: https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white
[Tailwind-url]: https://tailwindcss.com/
[NestJS]: https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white
[Nest-url]: https://nestjs.com/
[PostgreSQL]: https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white
[Postgres-url]: https://www.postgresql.org/
[Drizzle]: https://img.shields.io/badge/Drizzle_ORM-C5F74F?style=for-the-badge&logo=drizzle&logoColor=black
[Drizzle-url]: https://orm.drizzle.team/
[Keycloak]: https://img.shields.io/badge/Keycloak-008080?style=for-the-badge&logo=keycloak&logoColor=white
[Keycloak-url]: https://www.keycloak.org/
[Bun]: https://img.shields.io/badge/Bun-000000?style=for-the-badge&logo=bun&logoColor=white
[Bun-url]: https://bun.sh/
[Moonrepo]: https://img.shields.io/badge/Moonrepo-5046E5?style=for-the-badge&logo=moonrepo&logoColor=white
[Moon-url]: https://moonrepo.dev/
[Docker]: https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white
[Docker-url]: https://www.docker.com/
[ttu-data-infra-url]: https://github.com/tan-tao-university/ttu-data-infra
[ttu-identity-url]: https://github.com/tan-tao-university/ttu-identity
[ttu-faculty-platform-url]: https://github.com/tan-tao-university/ttu-faculty-platform
[ttu-platform-url]: https://github.com/tan-tao-university/ttu-platform
