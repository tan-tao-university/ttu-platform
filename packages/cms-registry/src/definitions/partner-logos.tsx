/**
 * PartnerLogos section — grid of partner / institutional logos.
 *
 * Logos are MediaReference ids. Render placeholder when no media service
 * is wired yet.
 */
import { z } from "zod";
import { Container, Grid, Section, SectionHeading } from "@ttu/design-system";
import { ColumnTokenSchema } from "@ttu/shared/column-token-schema";
import type { ComponentDefinition } from "../definition";
import { register } from "../registry";
import { sectionStyleProps } from "../resolve-style";

// ─── Schemas ───────────────────────────────────────────────────────────

export const PartnerLogoSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  /** MediaReference id. */
  logoId: z.string().optional(),
  href: z.string().optional(),
});
export type PartnerLogo = z.infer<typeof PartnerLogoSchema>;

export const PartnerLogosContentSchema = z.object({
  eyebrow: z.string().optional(),
  title: z.string().min(1).optional(),
  logos: z.array(PartnerLogoSchema).min(1).max(30),
});
export type PartnerLogosContent = z.infer<typeof PartnerLogosContentSchema>;

export const PartnerLogosConfigSchema = z.object({});
export type PartnerLogosConfig = z.infer<typeof PartnerLogosConfigSchema>;

export const PartnerLogosStyleSchema = z.object({
  contentWidth: z.enum(["sm", "md", "lg", "xl", "2xl", "full"]).default("xl"),
  columns: ColumnTokenSchema.default(6),
  logoSize: z.enum(["sm", "md", "lg"]).default("md"),
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
export type PartnerLogosStyle = z.infer<typeof PartnerLogosStyleSchema>;

// ─── Component ─────────────────────────────────────────────────────────

const LOGO_SIZE_CLASS = {
  sm: "h-10",
  md: "h-16",
  lg: "h-24",
} as const;

function PartnerLogosRenderer({
  content,
  style,
}: {
  content: PartnerLogosContent;
  config: PartnerLogosConfig;
  style: PartnerLogosStyle;
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
            align="center"
            titleSize="md"
            className="mx-auto"
          />
        ) : null}
        <Grid
          columns={style.columns}
          gap="lg"
          className={`mt-${content.title ? "10" : "0"}`}
        >
          {content.logos.map((logo) => (
            <div
              key={logo.id}
              className={`flex items-center justify-center ${LOGO_SIZE_CLASS[style.logoSize]}`}
            >
              {logo.href ? (
                <a
                  href={logo.href}
                  className="flex h-full items-center justify-center grayscale hover:grayscale-0 transition-all"
                  aria-label={logo.name}
                  target={logo.href.startsWith("http") ? "_blank" : undefined}
                  rel={
                    logo.href.startsWith("http")
                      ? "noopener noreferrer"
                      : undefined
                  }
                >
                  <div className="flex h-full w-full max-w-[160px] items-center justify-center rounded-md bg-muted/60 px-4 text-sm font-semibold text-muted-foreground">
                    {logo.name}
                  </div>
                </a>
              ) : (
                <div className="flex h-full w-full max-w-[160px] items-center justify-center rounded-md bg-muted/60 px-4 text-sm font-semibold text-muted-foreground">
                  {logo.name}
                </div>
              )}
            </div>
          ))}
        </Grid>
      </Container>
    </Section>
  );
}

// ─── Definition ────────────────────────────────────────────────────────

export const partnerLogosDefinition: ComponentDefinition<
  PartnerLogosContent,
  PartnerLogosConfig,
  PartnerLogosStyle
> = {
  key: "partner-logos",
  version: 1,
  name: "Partner Logos",
  category: "other",
  description: "Hiển thị logo các đối tác / tổ chức.",
  contentSchema: PartnerLogosContentSchema,
  configSchema: PartnerLogosConfigSchema,
  styleSchema: PartnerLogosStyleSchema,
  defaultContent: {
    title: "Đối tác chiến lược",
    logos: [],
  },
  defaultConfig: {},
  defaultStyle: {
    contentWidth: "xl",
    columns: 6,
    logoSize: "md",
    paddingTop: "lg",
    paddingBottom: "lg",
    background: "default",
  },
  variants: ["default"],
  editorMetadata: [
    { name: "title", label: "Tiêu đề", type: "text" },
    { name: "eyebrow", label: "Eyebrow", type: "text" },
    {
      name: "logos",
      label: "Danh sách logo",
      type: "repeater",
      helpText: "Upload logo trong Media Library rồi chọn.",
    },
  ],
  Component: PartnerLogosRenderer,
};

register(partnerLogosDefinition);
