/**
 * ImageText section — image + text side-by-side block.
 */
import { z } from "zod";
import { Container, Section } from "@ttu/design-system";
import type { ComponentDefinition } from "../definition";
import { register } from "../registry";
import { resolveAlign, sectionStyleProps } from "../resolve-style";

// ─── Schemas ───────────────────────────────────────────────────────────

export const ImageTextContentSchema = z.object({
  eyebrow: z.string().optional(),
  title: z.string().min(1),
  body: z.string().min(1),
  imageAlt: z.string().min(1),
  ctaLabel: z.string().optional(),
});
export type ImageTextContent = z.infer<typeof ImageTextContentSchema>;

export const ImageTextConfigSchema = z.object({
  /** MediaReference id. */
  imageId: z.string().optional(),
  ctaUrl: z.string().optional(),
  imageSide: z.enum(["left", "right"]).default("right"),
});
export type ImageTextConfig = z.infer<typeof ImageTextConfigSchema>;

export const ImageTextStyleSchema = z.object({
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
    .default("default"),
});
export type ImageTextStyle = z.infer<typeof ImageTextStyleSchema>;

// ─── Component ─────────────────────────────────────────────────────────

function ImageTextRenderer({
  content,
  config,
  style,
}: {
  content: ImageTextContent;
  config: ImageTextConfig;
  style: ImageTextStyle;
}) {
  const sectionProps = sectionStyleProps(style);
  const align = resolveAlign(style.textAlign);

  return (
    <Section
      paddingTop={sectionProps.paddingTop}
      paddingBottom={sectionProps.paddingBottom}
      background={sectionProps.background}
    >
      <Container
        width={style.contentWidth === "full" ? "2xl" : style.contentWidth}
      >
        <div
          className={`grid gap-10 lg:grid-cols-2 lg:items-center ${
            config.imageSide === "left" ? "lg:[&>*:first-child]:order-2" : ""
          }`}
        >
          <div>
            {content.eyebrow ? (
              <p className="mb-2 text-sm font-medium uppercase tracking-wider text-primary">
                {content.eyebrow}
              </p>
            ) : null}
            <h2
              className={`text-3xl md:text-4xl font-bold tracking-tight ${align}`}
            >
              {content.title}
            </h2>
            <p
              className={`mt-4 text-base text-muted-foreground leading-relaxed ${align}`}
            >
              {content.body}
            </p>
            {content.ctaLabel && config.ctaUrl ? (
              <a
                href={config.ctaUrl}
                className="mt-6 inline-flex items-center gap-1 text-base font-medium text-primary hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded"
              >
                {content.ctaLabel}
                <span aria-hidden="true">→</span>
              </a>
            ) : null}
          </div>
          <div
            className="aspect-[4/3] w-full rounded-lg bg-muted"
            role="img"
            aria-label={content.imageAlt}
          />
        </div>
      </Container>
    </Section>
  );
}

// ─── Definition ────────────────────────────────────────────────────────

export const imageTextDefinition: ComponentDefinition<
  ImageTextContent,
  ImageTextConfig,
  ImageTextStyle
> = {
  key: "image-text",
  version: 1,
  name: "Image + Text",
  category: "layout",
  description: "Khối hình ảnh kết hợp văn bản song song.",
  contentSchema: ImageTextContentSchema,
  configSchema: ImageTextConfigSchema,
  styleSchema: ImageTextStyleSchema,
  defaultContent: {
    title: "Về chúng tôi",
    body: "Trường Đại học Tân Tạo xây dựng môi trường học tập chuẩn quốc tế, đào tạo nguồn nhân lực chất lượng cao.",
    imageAlt: "Sinh viên TTU trong giờ học",
    ctaLabel: "Tìm hiểu thêm",
  },
  defaultConfig: {
    imageSide: "right",
    ctaUrl: "/gioi-thieu",
  },
  defaultStyle: {
    contentWidth: "xl",
    textAlign: "left",
    paddingTop: "xl",
    paddingBottom: "xl",
    background: "default",
  },
  variants: ["default"],
  editorMetadata: [
    { name: "eyebrow", label: "Eyebrow", type: "text" },
    { name: "title", label: "Tiêu đề", type: "text", required: true },
    { name: "body", label: "Nội dung", type: "rich-text", required: true },
    { name: "imageAlt", label: "Alt ảnh", type: "text", required: true },
    { name: "ctaLabel", label: "Nhãn CTA", type: "text" },
    { name: "ctaUrl", label: "URL CTA", type: "url" },
    { name: "imageId", label: "Ảnh", type: "image" },
    {
      name: "imageSide",
      label: "Vị trí ảnh",
      type: "segmented-control",
      options: ["left", "right"],
    },
  ],
  Component: ImageTextRenderer,
};

register(imageTextDefinition);
