/**
 * NewsGrid section — dynamic component.
 *
 * In production, the API fetches news articles based on `config.categoryId`
 * and `config.limit`. For now we accept the article list as content
 * (typed mock data) so the frontend can render before API is ready.
 *
 * Section **does not** store article bodies. When CMS is live, the
 * renderer will call content service with the config and get articles.
 */
import { z } from "zod";
import Link from "next/link";
import {
  Card,
  Container,
  Grid,
  Section,
  SectionHeading,
} from "@ttu/design-system";
import { ColumnTokenSchema } from "@ttu/shared";
import type { ComponentDefinition } from "../definition";
import { register } from "../registry";
import { sectionStyleProps } from "../resolve-style";

// ─── Schemas ───────────────────────────────────────────────────────────

export const NewsArticleSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  excerpt: z.string().optional(),
  href: z.string().min(1),
  publishedAt: z.string().optional(),
  category: z.string().optional(),
  /** MediaReference id — resolved by renderer. */
  thumbnailId: z.string().optional(),
});
export type NewsArticle = z.infer<typeof NewsArticleSchema>;

export const NewsGridContentSchema = z.object({
  eyebrow: z.string().optional(),
  title: z.string().min(1),
  description: z.string().optional(),
  /** Display list. In production, this comes from the content service. */
  articles: z.array(NewsArticleSchema).min(1).max(12),
  viewAllLabel: z.string().optional(),
});
export type NewsGridContent = z.infer<typeof NewsGridContentSchema>;

export const NewsGridConfigSchema = z.object({
  /** When the API is live, categoryId is the source-of-truth selector. */
  categoryId: z.string().optional(),
  limit: z.number().int().min(1).max(12).optional(),
  viewAllUrl: z.string().optional(),
});
export type NewsGridConfig = z.infer<typeof NewsGridConfigSchema>;

export const NewsGridStyleSchema = z.object({
  contentWidth: z.enum(["sm", "md", "lg", "xl", "2xl", "full"]).default("xl"),
  columns: ColumnTokenSchema.default(3),
  cardVariant: z.enum(["default", "compact", "feature"]).default("default"),
  textAlign: z.enum(["left", "center", "right"]).default("left"),
  paddingTop: z
    .enum(["none", "xs", "sm", "md", "lg", "xl", "2xl"])
    .default("xl"),
  paddingBottom: z
    .enum(["none", "xs", "sm", "md", "lg", "xl", "2xl"])
    .default("xl"),
  background: z
    .enum(["default", "surface", "muted", "primary", "secondary", "dark"])
    .default("default"),
});
export type NewsGridStyle = z.infer<typeof NewsGridStyleSchema>;

// ─── Component ─────────────────────────────────────────────────────────

function NewsGridRenderer({
  content,
  config,
  style,
}: {
  content: NewsGridContent;
  config: NewsGridConfig;
  style: NewsGridStyle;
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
        <Grid columns={style.columns} gap="md" className="mt-10">
          {content.articles.map((article) => (
            <Card
              key={article.id}
              hover
              padding="none"
              radius="lg"
              className="overflow-hidden flex flex-col"
            >
              {/* Thumbnail placeholder — replace with <Image> when media resolution lands */}
              <div
                className="aspect-[16/10] w-full bg-muted"
                aria-hidden="true"
              />
              <div className="flex flex-col gap-2 p-5 flex-1">
                {article.category ? (
                  <span className="text-xs font-medium uppercase tracking-wider text-primary">
                    {article.category}
                  </span>
                ) : null}
                <h3 className="text-lg font-semibold leading-snug text-foreground">
                  <Link
                    href={article.href}
                    className="hover:text-primary transition-colors"
                  >
                    {article.title}
                  </Link>
                </h3>
                {article.excerpt ? (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {article.excerpt}
                  </p>
                ) : null}
                {article.publishedAt ? (
                  <time className="mt-auto text-xs text-muted-foreground">
                    {new Date(article.publishedAt).toLocaleDateString("vi-VN")}
                  </time>
                ) : null}
              </div>
            </Card>
          ))}
        </Grid>
      </Container>
    </Section>
  );
}

// ─── Definition ────────────────────────────────────────────────────────

export const newsGridDefinition: ComponentDefinition<
  NewsGridContent,
  NewsGridConfig,
  NewsGridStyle
> = {
  key: "news-grid",
  version: 1,
  name: "News Grid",
  category: "content",
  description: "Lưới tin tức. Lấy dữ liệu từ content service theo config.",
  contentSchema: NewsGridContentSchema,
  configSchema: NewsGridConfigSchema,
  styleSchema: NewsGridStyleSchema,
  defaultContent: {
    title: "Tin tức & Sự kiện",
    description: "Cập nhật những hoạt động mới nhất của TTU.",
    articles: [],
    viewAllLabel: "Xem tất cả",
  },
  defaultConfig: {
    categoryId: undefined,
    limit: 6,
    viewAllUrl: "/tin-tuc",
  },
  defaultStyle: {
    contentWidth: "xl",
    columns: 3,
    cardVariant: "default",
    textAlign: "left",
    paddingTop: "xl",
    paddingBottom: "xl",
    background: "default",
  },
  variants: ["default", "compact", "feature"],
  editorMetadata: [
    { name: "eyebrow", label: "Eyebrow", type: "text" },
    { name: "title", label: "Tiêu đề", type: "text", required: true },
    { name: "description", label: "Mô tả", type: "textarea" },
    { name: "viewAllLabel", label: 'Nhãn "Xem tất cả"', type: "text" },
    { name: "viewAllUrl", label: 'URL "Xem tất cả"', type: "url" },
    {
      name: "categoryId",
      label: "Category ID",
      type: "reference",
      helpText: "Chọn category từ Content domain để lọc bài viết.",
    },
    { name: "limit", label: "Số bài hiển thị", type: "number" },
  ],
  Component: NewsGridRenderer,
};

register(newsGridDefinition);
