// Asset paths for the Home page, sourced from the Figma "Trang chủ" frame
// (file key: Fekw3aQtCfQbHq2aoho859).
//
// Every entry below is a `public/figma/home/<file>.*` served by Next.js at
// `/figma/home/<file>.*`. Source-of-truth node IDs are noted for each asset
// so future Figma edits can be re-traced.

export const HOME_IMAGES = {
  /** Hero section background — node 1387:181554, with a navy→green gradient overlay. */
  hero: '/figma/home/hero-bg.png',

  /** Hero admissions CTA arrow — node I186:13298;5:3024;5:3010. */
  heroArrow: '/figma/home/hero-arrow.svg',

  /** "Tấm vé thông hành" About section image — node 209:16851. */
  about: '/figma/home/stats-bg.png',

  /** Centered play control for the About campus image — node 209:16847. */
  aboutPlay: '/figma/home/about-play.svg',

  /** Why-TTU card mosaic background — node 188:13299 / 1275:174036. */
  whyTtuBackground: '/figma/home/why-ttu-bg.png',

  /** Why-TTU inset photo (right column) — node 189:13316 / 1275:174036. */
  whyTtuPhoto: '/figma/home/why-ttu-photo.png',

  /**
   * Training systems grid (4 cards): Chính quy, Sau đại học, Văn bằng 2, Liên thông — node
   * 190:13321.
   */
  trainingChinhQuy: '/figma/home/training-chinhquy.png',
  trainingSauDaiHoc: '/figma/home/training-saudaihoc.png',
  trainingVanBang2: '/figma/home/training-vanbang2.png',
  trainingLienThong: '/figma/home/training-lienthong.png',

  /** "Học bổng tuyển sinh 2026" full-bleed background — node 1005:175084 / 475:46778. */
  scholarship: '/figma/home/scholarship-bg.png',

  /** "06 Phương thức xét tuyển" full-bleed background — node 457:49664 / 340:13512. */
  admissionsBackground: '/figma/home/admissions-bg.png',

  /** Decorative overlay inside the admissions section — node 457:49664 / 1375:175162. */
  admissionsDecoration: '/figma/home/admissions-deco.png',

  /** Featured announcement card — node 204:16682 / 204:13527. */
  announcementFeatured: '/figma/home/announcement-featured.png',

  /** Announcement list thumbnail (reused 4×) — node 204:16682. */
  announcementThumb: '/figma/home/announcement-thumb.png',

  /** Partner logos — node 1311:174142–174232. */
  partner1: '/figma/home/partner-1.png',
  partner2: '/figma/home/partner-2.png',
  partner3: '/figma/home/partner-3.png',
  partner4: '/figma/home/partner-4.png',

  /** News cards (3×) — node 204:16741, 204:16746, 204:16751. */
  news1: '/figma/home/news-1.png',
  news2: '/figma/home/news-2.png',
  news3: '/figma/home/news-3.png',
} as const;

export type HomeImageKey = keyof typeof HOME_IMAGES;
