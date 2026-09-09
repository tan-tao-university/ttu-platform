/**
 * CTA section — a single, focused call-to-action banner.
 */
import { z } from "zod";
import Link from "next/link";
import { Container, Section, SectionHeading } from "@ttu/design-system";
import type { ComponentDefinition } from "../definition";
import { register } from "../registry";
import { resolveAlign, sectionStyleProps } from "../resolve-style";

// ─── Schemas ───────────────────────────────────────────────────────────

export const CTAContentSchema = z.object({
  eyebrow: z.string().optional(),
  title: z.string().min(1),
  description: z.string().optional(),
  buttonLabel: z.string().min(1),
});
export type CTAContent = z.infer<typeof CTAContentSchema>;

export const CTAConfigSchema = z.object({
  buttonUrl: z.string().min(1),
});
export type CTAConfig = z.infer<typeof CTAConfigSchema>;

export const CTAStyleSchema = z.object({
  contentWidth: z.enum(["sm", "md", "lg", "xl", "2xl", "full"]).default("xl"),
  textAlign: z.enum(["left", "center", "right"]).default("center"),
  paddingTop: z
    .enum(["none", "xs", "sm", "md", "lg", "xl", "2xl"])
    .default("xl"),
  paddingBottom: z
    .enum(["none", "xs", "sm", "md", "lg", "xl", "2xl"])
    .default("xl"),
  background: z
    .enum(["default", "surface", "muted", "primary", "secondary", "dark"])
    .default("primary"),
});
export type CTAStyle = z.infer<typeof CTAStyleSchema>;

// ─── Component ─────────────────────────────────────────────────────────

function CTARenderer({
  content,
  config,
  style,
}: {
  content: CTAContent;
  config: CTAConfig;
  style: CTAStyle;
}) {
  const sectionProps = sectionStyleProps(style);
  const align = resolveAlign(style.textAlign);
  const isPrimary =
    style.background === "primary" ||
    style.background === "secondary" ||
    style.background === "dark";

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
          className={`${align} max-w-3xl ${align === "text-center" ? "mx-auto" : ""}`}
        >
          <SectionHeading
            eyebrow={content.eyebrow}
            title={content.title}
            description={content.description}
            align={style.textAlign}
            titleSize="lg"
          />
          <div
            className={
              align === "text-center" ? "mt-8 flex justify-center" : "mt-8"
            }
          >
            <Link
              href={config.buttonUrl}
              className={
                isPrimary
                  ? "inline-flex items-center justify-center rounded-md bg-background px-8 py-4 text-base font-medium text-foreground hover:bg-background/90 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-background focus-visible:ring-offset-2"
                  : "inline-flex items-center justify-center rounded-md bg-primary px-8 py-4 text-base font-medium text-primary-foreground hover:bg-primary/90 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              }
            >
              {content.buttonLabel}
            </Link>
          </div>
        </div>
      </Container>
    </Section>
  );
}

// ─── Definition ────────────────────────────────────────────────────────

export const ctaDefinition: ComponentDefinition<
  CTAContent,
  CTAConfig,
  CTAStyle
> = {
  key: "cta",
  version: 1,
  name: "CTA",
  category: "marketing",
  description: "Call-to-action banner nổi bật, dẫn tới landing page.",
  contentSchema: CTAContentSchema,
  configSchema: CTAConfigSchema,
  styleSchema: CTAStyleSchema,
  defaultContent: {
    eyebrow: "Tuyển sinh 2026",
    title: "Bắt đầu hành trình tại TTU",
    description:
      "Nộp hồ sơ trực tuyến hoặc liên hệ Phòng Tuyển sinh để được hỗ trợ 1-1.",
    buttonLabel: "Đăng ký tư vấn",
  },
  defaultConfig: {
    buttonUrl: "/tuyen-sinh/dang-ky",
  },
  defaultStyle: {
    contentWidth: "xl",
    textAlign: "center",
    paddingTop: "xl",
    paddingBottom: "xl",
    background: "primary",
  },
  variants: ["default"],
  editorMetadata: [
    { name: "eyebrow", label: "Eyebrow", type: "text" },
    { name: "title", label: "Tiêu đề", type: "text", required: true },
    { name: "description", label: "Mô tả", type: "textarea" },
    { name: "buttonLabel", label: "Nhãn nút", type: "text", required: true },
    { name: "buttonUrl", label: "URL nút", type: "url", required: true },
  ],
  Component: CTARenderer,
};

register(ctaDefinition);
