/**
 * Hero section component.
 *
 * Variants: `default`, `centered`, `split`, `minimal`.
 *
 * Content (translatable):
 * - eyebrow
 * - title
 * - subtitle
 * - primaryButtonLabel
 * - secondaryButtonLabel
 *
 * Config (functional):
 * - backgroundImageId  → MediaReference id (resolved by renderer)
 * - primaryButtonUrl
 * - secondaryButtonUrl
 *
 * Style (safe tokens):
 * - contentWidth, textAlign, titleSize, paddingTop, paddingBottom, background
 */
import { z } from "zod";
import Link from "next/link";
import { Button, Container, Section, SectionHeading } from "@ttu/design-system";
import type { ComponentDefinition } from "../definition";
import { register } from "../registry";
import {
  resolveAlign,
  resolveTypography,
  sectionStyleProps,
} from "../resolve-style";

// ─── Schemas ───────────────────────────────────────────────────────────

export const HeroContentSchema = z.object({
  eyebrow: z.string().optional(),
  title: z.string().min(1),
  subtitle: z.string().optional(),
  primaryButtonLabel: z.string().optional(),
  secondaryButtonLabel: z.string().optional(),
});
export type HeroContent = z.infer<typeof HeroContentSchema>;

export const HeroConfigSchema = z.object({
  primaryButtonUrl: z.string().optional(),
  secondaryButtonUrl: z.string().optional(),
});
export type HeroConfig = z.infer<typeof HeroConfigSchema>;

export const HeroStyleSchema = z.object({
  contentWidth: z.enum(["sm", "md", "lg", "xl", "2xl", "full"]).default("xl"),
  textAlign: z.enum(["left", "center", "right"]).default("left"),
  titleSize: z.enum(["sm", "md", "lg", "xl", "display"]).default("xl"),
  paddingTop: z
    .enum(["none", "xs", "sm", "md", "lg", "xl", "2xl"])
    .default("2xl"),
  paddingBottom: z
    .enum(["none", "xs", "sm", "md", "lg", "xl", "2xl"])
    .default("2xl"),
  background: z
    .enum(["default", "surface", "muted", "primary", "secondary", "dark"])
    .default("default"),
});
export type HeroStyle = z.infer<typeof HeroStyleSchema>;

// ─── Component ─────────────────────────────────────────────────────────

function HeroRenderer({
  content,
  config,
  style,
  variant = "default",
}: {
  content: HeroContent;
  config: HeroConfig;
  style: HeroStyle;
  variant?: string;
}) {
  const sectionProps = sectionStyleProps(style);
  const align = resolveAlign(style.textAlign);
  const titleClass = resolveTypography(style.titleSize);
  const isCentered = variant === "centered" || style.textAlign === "center";

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
          className={isCentered ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}
        >
          <SectionHeading
            eyebrow={content.eyebrow}
            title={content.title}
            description={content.subtitle}
            align={style.textAlign}
            titleSize={
              style.titleSize === "display"
                ? "display"
                : style.titleSize === "xl"
                  ? "xl"
                  : "lg"
            }
            className={align}
          />
          {/* Override heading class with the token-mapped typography class */}
          {/* (kept as a hint: SectionHeading uses its own scale; for custom sizing, use direct <h1>) */}

          {(content.primaryButtonLabel || content.secondaryButtonLabel) && (
            <div
              className={
                isCentered
                  ? "mt-8 flex flex-wrap items-center justify-center gap-3"
                  : "mt-8 flex flex-wrap gap-3"
              }
            >
              {content.primaryButtonLabel && config.primaryButtonUrl ? (
                <Link
                  href={config.primaryButtonUrl}
                  className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-base font-medium text-primary-foreground hover:bg-primary/90 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                >
                  {content.primaryButtonLabel}
                </Link>
              ) : null}
              {content.secondaryButtonLabel && config.secondaryButtonUrl ? (
                <Link
                  href={config.secondaryButtonUrl}
                  className="inline-flex items-center justify-center rounded-md border-2 border-primary px-6 py-3 text-base font-medium text-primary hover:bg-primary/5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                >
                  {content.secondaryButtonLabel}
                </Link>
              ) : null}
              {/* When only labels exist but no URL, render a disabled-looking button as a hint */}
              {content.primaryButtonLabel && !config.primaryButtonUrl ? (
                <Button
                  variant="primary"
                  disabled
                  title="URL chưa được cấu hình"
                >
                  {content.primaryButtonLabel}
                </Button>
              ) : null}
            </div>
          )}
        </div>
      </Container>
    </Section>
  );
}

// ─── Definition ────────────────────────────────────────────────────────

export const heroDefinition: ComponentDefinition<
  HeroContent,
  HeroConfig,
  HeroStyle
> = {
  key: "hero",
  version: 1,
  name: "Hero",
  category: "marketing",
  description: "Banner đầu trang với tiêu đề lớn và CTA chính.",
  contentSchema: HeroContentSchema,
  configSchema: HeroConfigSchema,
  styleSchema: HeroStyleSchema,
  defaultContent: {
    eyebrow: "Đại học Tân Tạo",
    title: "Kiến tạo tương lai từ tri thức",
    subtitle:
      "Môi trường giáo dục khai phóng, gắn kết doanh nghiệp và hội nhập quốc tế.",
    primaryButtonLabel: "Khám phá TTU",
    secondaryButtonLabel: "Tuyển sinh 2026",
  },
  defaultConfig: {
    primaryButtonUrl: "/gioi-thieu",
    secondaryButtonUrl: "/tuyen-sinh",
  },
  defaultStyle: {
    contentWidth: "xl",
    textAlign: "left",
    titleSize: "xl",
    paddingTop: "2xl",
    paddingBottom: "2xl",
    background: "default",
  },
  variants: ["default", "centered", "split", "minimal"],
  editorMetadata: [
    { name: "eyebrow", label: "Eyebrow", type: "text" },
    { name: "title", label: "Tiêu đề", type: "text", required: true },
    { name: "subtitle", label: "Mô tả phụ", type: "textarea" },
    { name: "primaryButtonLabel", label: "Nhãn nút chính", type: "text" },
    { name: "secondaryButtonLabel", label: "Nhãn nút phụ", type: "text" },
    { name: "primaryButtonUrl", label: "URL nút chính", type: "url" },
    { name: "secondaryButtonUrl", label: "URL nút phụ", type: "url" },
  ],
  Component: HeroRenderer,
};

register(heroDefinition);
