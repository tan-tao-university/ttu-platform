/**
 * Mock homepage data.
 *
 * Until the CMS API is live, pages are constructed from typed mock data
 * that already matches the `Page` shape from `@ttu/shared`.
 *
 * When the API arrives, this module is replaced by a real fetch
 * (e.g. `getPublishedPageBySlug(slug, locale)`) without changing
 * the page renderers.
 */
import type { Page, PageSection } from "@ttu/shared";

const homepageVi: PageSection[] = [
  {
    id: "sec-1",
    componentKey: "hero",
    componentVersion: 1,
    variant: "default",
    config: {
      primaryButtonUrl: "/gioi-thieu",
      secondaryButtonUrl: "/tuyen-sinh",
    },
    style: {
      contentWidth: "xl",
      textAlign: "left",
      titleSize: "xl",
      paddingTop: "2xl",
      paddingBottom: "2xl",
      background: "default",
    },
    translations: {
      vi: {
        content: {
          eyebrow: "Trường Đại học Tân Tạo",
          title: "Kiến tạo tương lai từ tri thức",
          subtitle:
            "Môi trường giáo dục khai phóng, gắn kết doanh nghiệp và hội nhập quốc tế.",
          primaryButtonLabel: "Khám phá TTU",
          secondaryButtonLabel: "Tuyển sinh 2026",
        },
      },
    },
  },
  {
    id: "sec-2",
    componentKey: "announcement-list",
    componentVersion: 1,
    config: {
      limit: 4,
      viewAllUrl: "/thong-bao",
    },
    style: {
      contentWidth: "xl",
      textAlign: "left",
      paddingTop: "md",
      paddingBottom: "lg",
      background: "surface",
    },
    translations: {
      vi: {
        content: {
          title: "Thông báo mới",
          description: "Cập nhật từ Ban Giám hiệu và các Phòng ban.",
          viewAllLabel: "Tất cả thông báo",
          announcements: [
            {
              id: "a1",
              title: "Thông báo lịch thi cuối kỳ học kỳ Fall 2026",
              href: "/thong-bao/a1",
              publishedAt: "2026-09-05",
              severity: "info",
            },
            {
              id: "a2",
              title: "Đăng ký học phần học kỳ Spring 2027 — đợt 1",
              href: "/thong-bao/a2",
              publishedAt: "2026-09-03",
              severity: "urgent",
            },
            {
              id: "a3",
              title: 'Hội thảo "AI trong giáo dục đại học" — 15/09/2026',
              href: "/thong-bao/a3",
              publishedAt: "2026-09-01",
              severity: "info",
            },
            {
              id: "a4",
              title: "Thay đổi giờ mở cửa Thư viện trong tháng 9",
              href: "/thong-bao/a4",
              publishedAt: "2026-08-28",
              severity: "warning",
            },
          ],
        },
      },
    },
  },
  {
    id: "sec-3",
    componentKey: "statistics",
    componentVersion: 1,
    config: {},
    style: {
      contentWidth: "xl",
      columns: 4,
      textAlign: "center",
      paddingTop: "xl",
      paddingBottom: "xl",
      background: "muted",
    },
    translations: {
      vi: {
        content: {
          title: "Tân Tạo trong những con số",
          description: "Những cột mốc phản ánh sự phát triển bền vững của TTU.",
          items: [
            { value: "15+", label: "Ngành đào tạo" },
            { value: "50+", label: "Đối tác quốc tế" },
            { value: "10K+", label: "Sinh viên" },
            { value: "95%", label: "SV tốt nghiệp có việc làm" },
          ],
        },
      },
    },
  },
  {
    id: "sec-4",
    componentKey: "faculty-grid",
    componentVersion: 1,
    config: {},
    style: {
      contentWidth: "xl",
      columns: 4,
      textAlign: "left",
      paddingTop: "xl",
      paddingBottom: "xl",
      background: "default",
    },
    translations: {
      vi: {
        content: {
          title: "7 Khoa trực thuộc",
          description:
            "Đào tạo đa ngành, đáp ứng nhu cầu nhân lực quốc gia và quốc tế.",
          faculties: [
            {
              id: "f1",
              name: "Khoa Y",
              href: "/khoa/y",
              description: "Đào tạo Bác sĩ, Điều dưỡng, Răng-Hàm-Mặt.",
            },
            {
              id: "f2",
              name: "Khoa Kinh tế & Quản trị",
              href: "/khoa/kinh-te",
              description: "Quản trị kinh doanh, Tài chính, Marketing.",
            },
            {
              id: "f3",
              name: "Khoa Công nghệ",
              href: "/khoa/cong-nghe",
              description: "CNTT, Kỹ thuật phần mềm, AI & Data.",
            },
            {
              id: "f4",
              name: "Khoa Ngôn ngữ",
              href: "/khoa/ngon-ngu",
              description: "Tiếng Anh, VB2 Song ngữ.",
            },
            {
              id: "f5",
              name: "Khoa Luật",
              href: "/khoa/luat",
              description: "Luật kinh tế, Luật quốc tế.",
            },
            {
              id: "f6",
              name: "Khoa Kiến trúc",
              href: "/khoa/kien-truc",
              description: "Kiến trúc, Nội thất, Quy hoạch.",
            },
            {
              id: "f7",
              name: "Khoa Sư phạm",
              href: "/khoa/su-pham",
              description: "Giáo dục Tiểu học, Mầm non.",
            },
          ],
        },
      },
    },
  },
  {
    id: "sec-5",
    componentKey: "news-grid",
    componentVersion: 1,
    config: {
      categoryId: "all",
      limit: 3,
      viewAllUrl: "/tin-tuc",
    },
    style: {
      contentWidth: "xl",
      columns: 3,
      cardVariant: "default",
      textAlign: "left",
      paddingTop: "xl",
      paddingBottom: "xl",
      background: "surface",
    },
    translations: {
      vi: {
        content: {
          eyebrow: "Tin tức",
          title: "Hoạt động nổi bật",
          description:
            "Cập nhật những hoạt động mới nhất từ Trường và các Khoa.",
          viewAllLabel: "Tất cả tin tức",
          articles: [
            {
              id: "n1",
              title: "TTU ký kết hợp tác với Đại học Rice (Hoa Kỳ)",
              excerpt:
                "Chương trình liên kết đào tạo quốc tế chính thức được công bố với nhiều học bổng cho sinh viên TTU.",
              href: "/tin-tuc/n1",
              publishedAt: "2026-09-06",
              category: "Hợp tác quốc tế",
            },
            {
              id: "n2",
              title: "Khánh thành Trung tâm Mô phỏng Y khoa thế hệ mới",
              excerpt:
                "Trung tâm đầu tiên tại Việt Nam đạt chuẩn quốc tế phục vụ đào tạo Bác sĩ và Điều dưỡng.",
              href: "/tin-tuc/n2",
              publishedAt: "2026-09-04",
              category: "Cơ sở vật chất",
            },
            {
              id: "n3",
              title: "Sinh viên TTU đạt giải Nhất cuộc thi AI quốc gia 2026",
              excerpt:
                "Đội tuyển Khoa Công nghệ vượt qua hơn 200 đội từ 30 trường đại học trên cả nước.",
              href: "/tin-tuc/n3",
              publishedAt: "2026-08-30",
              category: "Thành tích sinh viên",
            },
          ],
        },
      },
    },
  },
  {
    id: "sec-6",
    componentKey: "event-list",
    componentVersion: 1,
    config: {
      limit: 3,
      viewAllUrl: "/su-kien",
    },
    style: {
      contentWidth: "xl",
      textAlign: "left",
      paddingTop: "xl",
      paddingBottom: "xl",
      background: "muted",
    },
    translations: {
      vi: {
        content: {
          title: "Sự kiện sắp tới",
          description: "Đừng bỏ lỡ các hoạt động quan trọng của TTU.",
          viewAllLabel: "Tất cả sự kiện",
          events: [
            {
              id: "e1",
              title: "Open Day 2026 — Khám phá TTU",
              description: "Ngày hội mở dành cho thí sinh và phụ huynh.",
              startsAt: "2026-09-20",
              location: "Cơ sở chính — Long An",
              href: "/su-kien/e1",
            },
            {
              id: "e2",
              title: 'Hội thảo "AI trong giáo dục đại học"',
              description: "Diễn giả từ Rice University, NTU, và ĐH Quốc gia.",
              startsAt: "2026-09-15",
              location: "Hội trường A — Cơ sở chính",
              href: "/su-kien/e2",
            },
            {
              id: "e3",
              title: "Tuần lễ Sinh viên Quốc tế 2026",
              description:
                "Chuỗi hoạt động giao lưu văn hóa, học thuật cho sinh viên.",
              startsAt: "2026-10-05",
              location: "Toàn trường",
              href: "/su-kien/e3",
            },
          ],
        },
      },
    },
  },
  {
    id: "sec-7",
    componentKey: "partner-logos",
    componentVersion: 1,
    config: {},
    style: {
      contentWidth: "xl",
      columns: 6,
      logoSize: "md",
      paddingTop: "lg",
      paddingBottom: "lg",
      background: "default",
    },
    translations: {
      vi: {
        content: {
          title: "Đối tác chiến lược",
          logos: [
            { id: "p1", name: "Rice University", href: "https://rice.edu" },
            { id: "p2", name: "NTU Singapore", href: "https://ntu.edu.sg" },
            { id: "p3", name: "ĐHQG TP.HCM", href: "https://vnuhcm.edu.vn" },
            {
              id: "p4",
              name: "Tập đoàn Tân Tạo",
              href: "https://tantaogroup.com.vn",
            },
            { id: "p5", name: "VinAI", href: "https://vinai.io" },
            { id: "p6", name: "FPT Software", href: "https://fptsoftware.com" },
          ],
        },
      },
    },
  },
  {
    id: "sec-8",
    componentKey: "cta",
    componentVersion: 1,
    config: {
      buttonUrl: "/tuyen-sinh/dang-ky",
    },
    style: {
      contentWidth: "xl",
      textAlign: "center",
      paddingTop: "xl",
      paddingBottom: "xl",
      background: "primary",
    },
    translations: {
      vi: {
        content: {
          eyebrow: "Tuyển sinh 2026",
          title: "Bắt đầu hành trình tại TTU",
          description:
            "Nộp hồ sơ trực tuyến hoặc liên hệ Phòng Tuyển sinh để được hỗ trợ 1-1.",
          buttonLabel: "Đăng ký tư vấn",
        },
      },
    },
  },
];

const homepageEn: PageSection[] = homepageVi.map((sec) => ({
  ...sec,
  // Lightweight English stub — keeps the structure but with English labels.
  // In production, each translation is independently edited.
  translations: {
    en: {
      content: {
        eyebrow: sec.translations.vi?.content?.eyebrow,
        title:
          (sec.translations.vi?.content?.title as string) ??
          "Tan Tao University",
        subtitle: sec.translations.vi?.content?.subtitle,
        primaryButtonLabel: "Discover TTU",
        secondaryButtonLabel: "Admissions 2026",
        body: sec.translations.vi?.content?.body,
        imageAlt: sec.translations.vi?.content?.imageAlt,
        ctaLabel: sec.translations.vi?.content?.ctaLabel,
        buttonLabel: sec.translations.vi?.content?.buttonLabel,
        description: sec.translations.vi?.content?.description,
        viewAllLabel: sec.translations.vi?.content?.viewAllLabel,
        title_en: sec.translations.vi?.content?.title,
        articles: sec.translations.vi?.content?.articles,
        events: sec.translations.vi?.content?.events,
        faculties: sec.translations.vi?.content?.faculties,
        announcements: sec.translations.vi?.content?.announcements,
        items: sec.translations.vi?.content?.items,
        logos: sec.translations.vi?.content?.logos,
      },
    },
  },
}));

export const HOMEPAGE_SLUG = "home";

export function getHomepageMock(locale: "vi" | "en"): Page {
  return {
    id: "page-home",
    slug: HOMEPAGE_SLUG,
    seo: {
      vi: {
        title: "Trường Đại học Tân Tạo",
        description: "Website chính thức Trường Đại học Tân Tạo",
      },
      en: {
        title: "Tan Tao University",
        description: "Official website of Tan Tao University",
      },
    },
    sections: locale === "en" ? homepageEn : homepageVi,
  };
}
