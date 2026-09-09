/**
 * AnnouncementList section — short, time-stamped announcements.
 */
import { z } from "zod";
import Link from "next/link";
import { Container, Section, SectionHeading, Stack } from "@ttu/design-system";
import type { ComponentDefinition } from "../definition";
import { register } from "../registry";
import { sectionStyleProps } from "../resolve-style";

// ─── Schemas ───────────────────────────────────────────────────────────

export const AnnouncementItemSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  href: z.string().min(1),
  publishedAt: z.string(),
  /** Optional severity: `info`, `warning`, `urgent`. */
  severity: z.enum(["info", "warning", "urgent"]).default("info"),
});
export type AnnouncementItem = z.infer<typeof AnnouncementItemSchema>;

export const AnnouncementListContentSchema = z.object({
  eyebrow: z.string().optional(),
  title: z.string().min(1),
  description: z.string().optional(),
  announcements: z.array(AnnouncementItemSchema).min(1).max(20),
  viewAllLabel: z.string().optional(),
});
export type AnnouncementListContent = z.infer<
  typeof AnnouncementListContentSchema
>;

export const AnnouncementListConfigSchema = z.object({
  limit: z.number().int().min(1).max(20).optional(),
  viewAllUrl: z.string().optional(),
});
export type AnnouncementListConfig = z.infer<
  typeof AnnouncementListConfigSchema
>;

export const AnnouncementListStyleSchema = z.object({
  contentWidth: z.enum(["sm", "md", "lg", "xl", "2xl", "full"]).default("xl"),
  textAlign: z.enum(["left", "center", "right"]).default("left"),
  paddingTop: z
    .enum(["none", "xs", "sm", "md", "lg", "xl", "2xl"])
    .default("lg"),
  paddingBottom: z
    .enum(["none", "xs", "sm", "md", "lg", "xl", "2xl"])
    .default("lg"),
  background: z
    .enum(["default", "surface", "muted", "primary", "secondary", "dark"])
    .default("surface"),
});
export type AnnouncementListStyle = z.infer<typeof AnnouncementListStyleSchema>;

const SEVERITY_DOT = {
  info: "bg-primary",
  warning: "bg-yellow-500",
  urgent: "bg-red-500",
} as const;

// ─── Component ─────────────────────────────────────────────────────────

function AnnouncementListRenderer({
  content,
  config,
  style,
}: {
  content: AnnouncementListContent;
  config: AnnouncementListConfig;
  style: AnnouncementListStyle;
}) {
  const sectionProps = sectionStyleProps(style);

  return (
    <Section
      paddingTop={sectionProps.paddingTop}
      paddingBottom={sectionProps.paddingBottom}
      background={sectionProps.background}
    >
      <Container
        width={style.contentWidth === "full" ? "2xl" : style.contentWidth}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading
            eyebrow={content.eyebrow}
            title={content.title}
            description={content.description}
            align={style.textAlign}
            titleSize="md"
            className="flex-1"
          />
          {content.viewAllLabel && config.viewAllUrl ? (
            <Link
              href={config.viewAllUrl}
              className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              {content.viewAllLabel}
              <span aria-hidden="true">→</span>
            </Link>
          ) : null}
        </div>
        <Stack
          gap="xs"
          className="mt-8 divide-y divide-border rounded-lg border border-border bg-background"
        >
          {content.announcements.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className="flex items-center gap-4 px-4 py-3 hover:bg-muted/50 transition-colors"
            >
              <span
                className={`h-2 w-2 flex-shrink-0 rounded-full ${SEVERITY_DOT[item.severity]}`}
                aria-label={`Mức độ: ${item.severity}`}
              />
              <span className="flex-1 truncate text-sm font-medium text-foreground">
                {item.title}
              </span>
              <time
                dateTime={item.publishedAt}
                className="flex-shrink-0 text-xs text-muted-foreground tabular-nums"
              >
                {new Date(item.publishedAt).toLocaleDateString("vi-VN")}
              </time>
            </Link>
          ))}
        </Stack>
      </Container>
    </Section>
  );
}

// ─── Definition ────────────────────────────────────────────────────────

export const announcementListDefinition: ComponentDefinition<
  AnnouncementListContent,
  AnnouncementListConfig,
  AnnouncementListStyle
> = {
  key: "announcement-list",
  version: 1,
  name: "Announcement List",
  category: "content",
  description: "Danh sách thông báo ngắn gọn.",
  contentSchema: AnnouncementListContentSchema,
  configSchema: AnnouncementListConfigSchema,
  styleSchema: AnnouncementListStyleSchema,
  defaultContent: {
    title: "Thông báo",
    description: "Các thông báo mới nhất từ Ban Giám hiệu và Phòng ban.",
    announcements: [],
    viewAllLabel: "Tất cả thông báo",
  },
  defaultConfig: {
    limit: 5,
    viewAllUrl: "/thong-bao",
  },
  defaultStyle: {
    contentWidth: "xl",
    textAlign: "left",
    paddingTop: "lg",
    paddingBottom: "lg",
    background: "surface",
  },
  variants: ["default"],
  editorMetadata: [
    { name: "eyebrow", label: "Eyebrow", type: "text" },
    { name: "title", label: "Tiêu đề", type: "text", required: true },
    { name: "description", label: "Mô tả", type: "textarea" },
    { name: "viewAllLabel", label: 'Nhãn "Xem tất cả"', type: "text" },
    { name: "viewAllUrl", label: 'URL "Xem tất cả"', type: "url" },
    { name: "limit", label: "Số thông báo hiển thị", type: "number" },
  ],
  Component: AnnouncementListRenderer,
};

register(announcementListDefinition);
