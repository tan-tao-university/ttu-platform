/**
 * RichText section — a single block of typographic content.
 */
import { z } from "zod";
import { Container, Section } from "@ttu/design-system";
import type { ComponentDefinition } from "../definition";
import { register } from "../registry";
import { resolveAlign, sectionStyleProps } from "../resolve-style";

// ─── Schemas ───────────────────────────────────────────────────────────

export const RichTextContentSchema = z.object({
  body: z.string().min(1),
});
export type RichTextContent = z.infer<typeof RichTextContentSchema>;

export const RichTextConfigSchema = z.object({});
export type RichTextConfig = z.infer<typeof RichTextConfigSchema>;

export const RichTextStyleSchema = z.object({
  contentWidth: z.enum(["sm", "md", "lg", "xl", "2xl", "full"]).default("md"),
  textAlign: z.enum(["left", "center", "right"]).default("left"),
  paddingTop: z
    .enum(["none", "xs", "sm", "md", "lg", "xl", "2xl"])
    .default("lg"),
  paddingBottom: z
    .enum(["none", "xs", "sm", "md", "lg", "xl", "2xl"])
    .default("lg"),
  background: z
    .enum(["default", "surface", "muted", "primary", "secondary", "dark"])
    .default("default"),
});
export type RichTextStyle = z.infer<typeof RichTextStyleSchema>;

// ─── Component ─────────────────────────────────────────────────────────

function RichTextRenderer({
  content,
  style,
}: {
  content: RichTextContent;
  config: RichTextConfig;
  style: RichTextStyle;
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
        <div className={`prose prose-lg max-w-none ${align}`}>
          {content.body.split("\n\n").map((para, i) => (
            <p key={i} className="leading-relaxed text-foreground">
              {para}
            </p>
          ))}
        </div>
      </Container>
    </Section>
  );
}

// ─── Definition ────────────────────────────────────────────────────────

export const richTextDefinition: ComponentDefinition<
  RichTextContent,
  RichTextConfig,
  RichTextStyle
> = {
  key: "rich-text",
  version: 1,
  name: "Rich Text",
  category: "layout",
  description: "Khối văn bản thuần, phù hợp cho phần giới thiệu / tuyên bố.",
  contentSchema: RichTextContentSchema,
  configSchema: RichTextConfigSchema,
  styleSchema: RichTextStyleSchema,
  defaultContent: {
    body: "Trường Đại học Tân Tạo (TTU) là cơ sở đào tạo đa ngành, định hướng ứng dụng, gắn kết chặt chẽ với doanh nghiệp và hội nhập quốc tế.",
  },
  defaultConfig: {},
  defaultStyle: {
    contentWidth: "md",
    textAlign: "left",
    paddingTop: "lg",
    paddingBottom: "lg",
    background: "default",
  },
  variants: ["default"],
  editorMetadata: [
    { name: "body", label: "Nội dung", type: "rich-text", required: true },
  ],
  Component: RichTextRenderer,
};

register(richTextDefinition);
