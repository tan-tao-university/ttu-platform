/**
 * QuickLinks section — a grid of short, prominent links.
 *
 * Useful for landing pages or sidebar navigation blocks.
 */
import { z } from "zod";
import Link from "next/link";
import { Container, Grid, Section, SectionHeading } from "@ttu/design-system";
import { ColumnTokenSchema } from "@ttu/shared";
import type { ComponentDefinition } from "../definition";
import { register } from "../registry";
import { sectionStyleProps } from "../resolve-style";

// ─── Schemas ───────────────────────────────────────────────────────────

export const QuickLinkItemSchema = z.object({
  id: z.string(),
  label: z.string().min(1),
  description: z.string().optional(),
  href: z.string().min(1),
  /** Optional icon name (Lucide). Resolved by renderer. */
  icon: z.string().optional(),
});
export type QuickLinkItem = z.infer<typeof QuickLinkItemSchema>;

export const QuickLinksContentSchema = z.object({
  eyebrow: z.string().optional(),
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  links: z.array(QuickLinkItemSchema).min(1).max(12),
});
export type QuickLinksContent = z.infer<typeof QuickLinksContentSchema>;

export const QuickLinksConfigSchema = z.object({});
export type QuickLinksConfig = z.infer<typeof QuickLinksConfigSchema>;

export const QuickLinksStyleSchema = z.object({
  contentWidth: z.enum(["sm", "md", "lg", "xl", "2xl", "full"]).default("xl"),
  columns: ColumnTokenSchema.default(3),
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
export type QuickLinksStyle = z.infer<typeof QuickLinksStyleSchema>;

// ─── Component ─────────────────────────────────────────────────────────

function QuickLinksRenderer({
  content,
  style,
}: {
  content: QuickLinksContent;
  config: QuickLinksConfig;
  style: QuickLinksStyle;
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
        {content.title ? (
          <SectionHeading
            eyebrow={content.eyebrow}
            title={content.title}
            description={content.description}
            align={style.textAlign}
            titleSize="md"
          />
        ) : null}
        <Grid
          columns={style.columns}
          gap="md"
          className={content.title ? "mt-10" : ""}
        >
          {content.links.map((link) => (
            <Link
              key={link.id}
              href={link.href}
              className="group flex flex-col gap-2 rounded-lg border border-border bg-surface p-5 transition-all hover:border-primary hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              <span className="text-base font-semibold text-foreground group-hover:text-primary transition-colors">
                {link.label}
                <span aria-hidden="true" className="ml-1">
                  →
                </span>
              </span>
              {link.description ? (
                <span className="text-sm text-muted-foreground">
                  {link.description}
                </span>
              ) : null}
            </Link>
          ))}
        </Grid>
      </Container>
    </Section>
  );
}

// ─── Definition ────────────────────────────────────────────────────────

export const quickLinksDefinition: ComponentDefinition<
  QuickLinksContent,
  QuickLinksConfig,
  QuickLinksStyle
> = {
  key: "quick-links",
  version: 1,
  name: "Quick Links",
  category: "other",
  description: "Lưới liên kết nhanh cho landing page hoặc sidebar.",
  contentSchema: QuickLinksContentSchema,
  configSchema: QuickLinksConfigSchema,
  styleSchema: QuickLinksStyleSchema,
  defaultContent: {
    title: "Liên kết nhanh",
    links: [],
  },
  defaultConfig: {},
  defaultStyle: {
    contentWidth: "xl",
    columns: 3,
    textAlign: "left",
    paddingTop: "lg",
    paddingBottom: "lg",
    background: "default",
  },
  variants: ["default"],
  editorMetadata: [
    { name: "title", label: "Tiêu đề", type: "text" },
    { name: "eyebrow", label: "Eyebrow", type: "text" },
    { name: "description", label: "Mô tả", type: "textarea" },
    {
      name: "links",
      label: "Danh sách liên kết",
      type: "repeater",
    },
  ],
  Component: QuickLinksRenderer,
};

register(quickLinksDefinition);
