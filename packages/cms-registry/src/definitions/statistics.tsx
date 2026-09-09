/**
 * Statistics section — a row of KPI numbers.
 *
 * Repeater pattern: `items` is an array of `{ value, label }`.
 */
import { z } from "zod";
import { Container, Grid, Section, SectionHeading } from "@ttu/design-system";
import { ColumnTokenSchema } from "@ttu/shared";
import type { ComponentDefinition } from "../definition";
import { register } from "../registry";
import { sectionStyleProps } from "../resolve-style";

// ─── Schemas ───────────────────────────────────────────────────────────

export const StatisticsContentSchema = z.object({
  eyebrow: z.string().optional(),
  title: z.string().min(1),
  description: z.string().optional(),
  items: z
    .array(
      z.object({
        value: z.string().min(1),
        label: z.string().min(1),
      }),
    )
    .min(1)
    .max(8),
});
export type StatisticsContent = z.infer<typeof StatisticsContentSchema>;

export const StatisticsConfigSchema = z.object({});
export type StatisticsConfig = z.infer<typeof StatisticsConfigSchema>;

export const StatisticsStyleSchema = z.object({
  contentWidth: z.enum(["sm", "md", "lg", "xl", "2xl", "full"]).default("xl"),
  columns: ColumnTokenSchema.default(4),
  textAlign: z.enum(["left", "center", "right"]).default("center"),
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
export type StatisticsStyle = z.infer<typeof StatisticsStyleSchema>;

// ─── Component ─────────────────────────────────────────────────────────

function StatisticsRenderer({
  content,
  style,
}: {
  content: StatisticsContent;
  config: StatisticsConfig;
  style: StatisticsStyle;
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
        <SectionHeading
          eyebrow={content.eyebrow}
          title={content.title}
          description={content.description}
          align={style.textAlign}
          titleSize="lg"
          className={style.textAlign === "center" ? "mx-auto" : ""}
        />
        <Grid columns={style.columns} gap="lg" className="mt-10">
          {content.items.map((item, idx) => (
            <div key={idx} className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-primary">
                {item.value}
              </div>
              <div className="mt-2 text-sm md:text-base text-muted-foreground">
                {item.label}
              </div>
            </div>
          ))}
        </Grid>
      </Container>
    </Section>
  );
}

// ─── Definition ────────────────────────────────────────────────────────

export const statisticsDefinition: ComponentDefinition<
  StatisticsContent,
  StatisticsConfig,
  StatisticsStyle
> = {
  key: "statistics",
  version: 1,
  name: "Statistics",
  category: "marketing",
  description: "Hiển thị các chỉ số KPI / số liệu nổi bật.",
  contentSchema: StatisticsContentSchema,
  configSchema: StatisticsConfigSchema,
  styleSchema: StatisticsStyleSchema,
  defaultContent: {
    title: "Tân Tạo trong những con số",
    description: "Những cột mốc phản ánh sự phát triển bền vững của TTU.",
    items: [
      { value: "15+", label: "Ngành đào tạo" },
      { value: "50+", label: "Đối tác quốc tế" },
      { value: "10K+", label: "Sinh viên" },
      { value: "95%", label: "Sinh viên tốt nghiệp có việc làm" },
    ],
  },
  defaultConfig: {},
  defaultStyle: {
    contentWidth: "xl",
    columns: 4,
    textAlign: "center",
    paddingTop: "xl",
    paddingBottom: "xl",
    background: "muted",
  },
  variants: ["default"],
  editorMetadata: [
    { name: "eyebrow", label: "Eyebrow", type: "text" },
    { name: "title", label: "Tiêu đề", type: "text", required: true },
    { name: "description", label: "Mô tả", type: "textarea" },
    {
      name: "items",
      label: "Danh sách chỉ số",
      type: "repeater",
      helpText: "Tối đa 8 cột. Mỗi mục gồm giá trị và nhãn.",
    },
  ],
  Component: StatisticsRenderer,
};

register(statisticsDefinition);
