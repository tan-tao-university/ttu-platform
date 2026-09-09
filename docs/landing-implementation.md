# Landing implementation (Figma -> React)

The `apps/web` landing page is built from Figma file [`Fekw3aQtCfQbHq2aoho859`](https://www.figma.com/design/Fekw3aQtCfQbHq2aoho859/T%C3%A2n-T%E1%BA%A1o-University-website-ch%C3%ADnh?node-id=184-6801&m=dev), root node `184:6801` (`Trang chu`). Static markup only — `apps/api` has no schema yet, so nothing here calls the API.

## Section map (Figma node -> React component)

| Figma node id | Component | File |
| --- | --- | --- |
| `1387:181554` | Hero | `apps/web/src/components/landing/Hero.tsx` |
| `1998:189150` | Intro / about | `apps/web/src/components/landing/IntroSection.tsx` |
| `189:13315` | Stats row | `apps/web/src/components/landing/StatsRow.tsx` |
| `1275:174036` | Why TTU | `apps/web/src/components/landing/WhyTtuSection.tsx` |
| `190:13321` | Programs (he dao tao) | `apps/web/src/components/landing/ProgramsSection.tsx` |
| `1005:175084` | Scholarships 2026 | `apps/web/src/components/landing/ScholarshipSection.tsx` |
| `457:49664` | Six admission methods | `apps/web/src/components/landing/AdmissionMethodsSection.tsx` |
| `204:16456` | Global network / partners | `apps/web/src/components/landing/GlobalNetworkSection.tsx` |
| `204:16682` | Announcements | `apps/web/src/components/landing/AnnouncementsSection.tsx` |
| `204:16766` | News and events | `apps/web/src/components/landing/NewsEventsSection.tsx` |
| `204:16769` | Admission form | `apps/web/src/components/landing/AdmissionFormSection.tsx` |
| `185:6802` | Site header | `apps/web/src/components/Header.tsx` |
| `185:9764` | Site footer | `apps/web/src/components/Footer.tsx` |

## Design tokens

Extracted once from Figma variables (`get_variable_defs` on `184:6801`) and stored in `apps/web/src/styles/tokens.css`. Exposed to Tailwind 4 via `@theme inline` in `apps/web/src/app/globals.css`.

| Figma name | Hex       | CSS variable            | Tailwind utility       |
| ---------- | --------- | ----------------------- | ---------------------- |
| Xanh Dam   | `#1F664C` | `--color-brand-deep`    | `bg-brand-deep`        |
| Xanh       | `#229A68` | `--color-brand`         | `bg-brand`             |
| Xanh Sang  | `#3DB97D` | `--color-brand-light`   | `bg-brand-light`       |
| Xanh Den   | `#103925` | `--color-brand-ink`     | `bg-brand-ink`         |
| Cam        | `#FF794A` | `--color-accent-orange` | `bg-accent-orange`     |
| Do         | `#E53D38` | `--color-accent-red`    | `bg-accent-red`        |
| Xam        | `#F2F2F2` | `--color-surface-muted` | `bg-surface-muted`     |
| Xam Dam    | `#D2D2D2` | `--color-border-strong` | `border-border-strong` |
| Trang      | `#FFFFFF` | `--color-surface`       | `bg-surface`           |

Typography is set directly with inline Tailwind utilities (`text-[40px]`, `font-bold`, `leading-[50px]`, etc.) because the Figma tokens are font shorthand, not plain CSS custom properties, and Tailwind 4 utilities cover the scale cleanly.

## Assets

All section and icon images load from `https://www.figma.com/api/mcp/asset/...` URLs. They expire after 7 days. Before going to production:

1. Re-export from Figma.
2. Mirror them under `apps/web/public/landing/`.
3. Swap the URLs in each component for local paths.

## Forms

`AdmissionFormSection` is a static visual layout — fields are not wired up. The header CTA points to `https://tuyensinh.ttu.edu.vn` (external admissions site owned by other programs). Real submission + validation arrives with the ERD work tracked in [docs/setup.md](setup.md).

## Out of scope

Mobile layouts, dark theme, RTL, animation, real CMS wiring.
