/**
 * EventList section — dynamic component for upcoming events.
 */
import { z } from "zod";
import Link from "next/link";
import {
  Card,
  Container,
  Section,
  SectionHeading,
  Stack,
} from "@ttu/design-system";
import type { ComponentDefinition } from "../definition";
import { register } from "../registry";
import { sectionStyleProps } from "../resolve-style";

// ─── Schemas ───────────────────────────────────────────────────────────

export const EventItemSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  description: z.string().optional(),
  startsAt: z.string(),
  endsAt: z.string().optional(),
  location: z.string().optional(),
  href: z.string().min(1),
});
export type EventItem = z.infer<typeof EventItemSchema>;

export const EventListContentSchema = z.object({
  eyebrow: z.string().optional(),
  title: z.string().min(1),
  description: z.string().optional(),
  events: z.array(EventItemSchema).min(1).max(20),
  viewAllLabel: z.string().optional(),
});
export type EventListContent = z.infer<typeof EventListContentSchema>;

export const EventListConfigSchema = z.object({
  categoryId: z.string().optional(),
  limit: z.number().int().min(1).max(20).optional(),
  viewAllUrl: z.string().optional(),
});
export type EventListConfig = z.infer<typeof EventListConfigSchema>;

export const EventListStyleSchema = z.object({
  contentWidth: z.enum(["sm", "md", "lg", "xl", "2xl", "full"]).default("xl"),
  textAlign: z.enum(["left", "center", "right"]).default("left"),
  paddingTop: z
    .enum(["none", "xs", "sm", "md", "lg", "xl", "2xl"])
    .default("xl"),
  paddingBottom: z
    .enum(["none", "xs", "sm", "md", "lg", "xl", "2xl"])
    .default("xl"),
  background: z
    .enum(["default", "surface", "muted", "primary", "secondary", "dark"])
    .default("muted"),
});
export type EventListStyle = z.infer<typeof EventListStyleSchema>;

// ─── Component ─────────────────────────────────────────────────────────

function formatDate(iso: string, locale: string): string {
  try {
    return new Intl.DateTimeFormat(locale === "en" ? "en-US" : "vi-VN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function EventListRenderer({
  content,
  config,
  style,
  locale,
}: {
  content: EventListContent;
  config: EventListConfig;
  style: EventListStyle;
  locale: string;
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
            titleSize="lg"
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
        <Stack gap="sm" className="mt-10">
          {content.events.map((event) => (
            <Card
              key={event.id}
              padding="md"
              radius="md"
              className="flex flex-col sm:flex-row sm:items-center gap-4"
            >
              <div className="flex-shrink-0 w-32 text-center sm:text-left">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">
                  {new Date(event.startsAt).toLocaleString(
                    locale === "en" ? "en-US" : "vi-VN",
                    { month: "short" },
                  )}
                </div>
                <div className="text-3xl font-bold text-primary">
                  {new Date(event.startsAt).getDate()}
                </div>
                <div className="text-xs text-muted-foreground">
                  {new Date(event.startsAt).getFullYear()}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-foreground">
                  <Link
                    href={event.href}
                    className="hover:text-primary transition-colors"
                  >
                    {event.title}
                  </Link>
                </h3>
                {event.description ? (
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                    {event.description}
                  </p>
                ) : null}
                {event.location ? (
                  <p className="mt-2 text-xs text-muted-foreground">
                    📍 {event.location}
                  </p>
                ) : null}
              </div>
              <time
                dateTime={event.startsAt}
                className="text-xs text-muted-foreground tabular-nums"
              >
                {formatDate(event.startsAt, locale)}
              </time>
            </Card>
          ))}
        </Stack>
      </Container>
    </Section>
  );
}

// ─── Definition ────────────────────────────────────────────────────────

export const eventListDefinition: ComponentDefinition<
  EventListContent,
  EventListConfig,
  EventListStyle
> = {
  key: "event-list",
  version: 1,
  name: "Event List",
  category: "content",
  description: "Danh sách sự kiện sắp tới. Lấy từ Event domain.",
  contentSchema: EventListContentSchema,
  configSchema: EventListConfigSchema,
  styleSchema: EventListStyleSchema,
  defaultContent: {
    title: "Sự kiện sắp tới",
    description: "Đừng bỏ lỡ các hoạt động quan trọng của TTU.",
    events: [],
    viewAllLabel: "Tất cả sự kiện",
  },
  defaultConfig: {
    limit: 5,
    viewAllUrl: "/su-kien",
  },
  defaultStyle: {
    contentWidth: "xl",
    textAlign: "left",
    paddingTop: "xl",
    paddingBottom: "xl",
    background: "muted",
  },
  variants: ["default"],
  editorMetadata: [
    { name: "eyebrow", label: "Eyebrow", type: "text" },
    { name: "title", label: "Tiêu đề", type: "text", required: true },
    { name: "description", label: "Mô tả", type: "textarea" },
    { name: "viewAllLabel", label: 'Nhãn "Xem tất cả"', type: "text" },
    { name: "viewAllUrl", label: 'URL "Xem tất cả"', type: "url" },
    { name: "categoryId", label: "Category ID", type: "reference" },
    { name: "limit", label: "Số sự kiện hiển thị", type: "number" },
  ],
  Component: EventListRenderer,
};

register(eventListDefinition);
