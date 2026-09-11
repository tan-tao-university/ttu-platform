/**
 * FacultyGrid section — TTU's 7 schools.
 *
 * NOTE: Faculty data is normally fetched from TTU Faculty Platform,
 * not stored in `ttu_main`. This component renders what's passed in
 * via content (typed mock until API/integration is wired).
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
import { ColumnTokenSchema } from "@ttu/shared/column-token-schema";
import type { ComponentDefinition } from "../definition";
import { register } from "../registry";
import { sectionStyleProps } from "../resolve-style";

// ─── Schemas ───────────────────────────────────────────────────────────

export const FacultyItemSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  description: z.string().optional(),
  href: z.string().min(1),
  /** MediaReference id. */
  logoId: z.string().optional(),
});
export type FacultyItem = z.infer<typeof FacultyItemSchema>;

export const FacultyGridContentSchema = z.object({
  eyebrow: z.string().optional(),
  title: z.string().min(1),
  description: z.string().optional(),
  faculties: z.array(FacultyItemSchema).min(1).max(20),
});
export type FacultyGridContent = z.infer<typeof FacultyGridContentSchema>;

export const FacultyGridConfigSchema = z.object({});
export type FacultyGridConfig = z.infer<typeof FacultyGridConfigSchema>;

export const FacultyGridStyleSchema = z.object({
  contentWidth: z.enum(["sm", "md", "lg", "xl", "2xl", "full"]).default("xl"),
  columns: ColumnTokenSchema.default(4),
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
export type FacultyGridStyle = z.infer<typeof FacultyGridStyleSchema>;

// ─── Component ─────────────────────────────────────────────────────────

function FacultyGridRenderer({
  content,
  style,
}: {
  content: FacultyGridContent;
  config: FacultyGridConfig;
  style: FacultyGridStyle;
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
        />
        <Grid columns={style.columns} gap="md" className="mt-10">
          {content.faculties.map((faculty) => (
            <Card
              key={faculty.id}
              hover
              padding="md"
              radius="lg"
              className="flex flex-col items-center text-center"
            >
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary">
                <span className="text-2xl font-bold">
                  {faculty.name.charAt(0)}
                </span>
              </div>
              <h3 className="mt-4 text-base font-semibold text-foreground">
                <Link
                  href={faculty.href}
                  className="hover:text-primary transition-colors"
                >
                  {faculty.name}
                </Link>
              </h3>
              {faculty.description ? (
                <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                  {faculty.description}
                </p>
              ) : null}
            </Card>
          ))}
        </Grid>
      </Container>
    </Section>
  );
}

// ─── Definition ────────────────────────────────────────────────────────

export const facultyGridDefinition: ComponentDefinition<
  FacultyGridContent,
  FacultyGridConfig,
  FacultyGridStyle
> = {
  key: "faculty-grid",
  version: 1,
  name: "Faculty Grid",
  category: "university",
  description: "Lưới các Khoa. Dữ liệu từ TTU Faculty Platform.",
  contentSchema: FacultyGridContentSchema,
  configSchema: FacultyGridConfigSchema,
  styleSchema: FacultyGridStyleSchema,
  defaultContent: {
    title: "7 Khoa trực thuộc",
    description:
      "Đào tạo đa ngành, đáp ứng nhu cầu nhân lực quốc gia và quốc tế.",
    faculties: [],
  },
  defaultConfig: {},
  defaultStyle: {
    contentWidth: "xl",
    columns: 4,
    textAlign: "left",
    paddingTop: "xl",
    paddingBottom: "xl",
    background: "default",
  },
  variants: ["default"],
  editorMetadata: [
    { name: "eyebrow", label: "Eyebrow", type: "text" },
    { name: "title", label: "Tiêu đề", type: "text", required: true },
    { name: "description", label: "Mô tả", type: "textarea" },
    {
      name: "faculties",
      label: "Danh sách khoa",
      type: "repeater",
      helpText: "Dữ liệu lấy từ TTU Faculty Platform (integration).",
    },
  ],
  Component: FacultyGridRenderer,
};

register(facultyGridDefinition);
