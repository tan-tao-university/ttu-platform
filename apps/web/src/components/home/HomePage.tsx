/**
 * TTU Homepage — built to match Figma design exactly.
 *
 * Sections (top to bottom):
 *  1. Hero        — full-width campus image + gradient + title + CTA
 *  2. Statistics  — "Những con số ấn tượng"
 *  3. About       — "Tấm vé thông hành trở thành công dân toàn cầu"
 *  4. Why TTU     — "Tại sao ĐẠI HỌC TÂN TẠO là lựa chọn khác biệt?"
 *  5. Training    — "Các hệ đào tạo"
 *  6. Programs    — "Chương trình đào tạo hệ chính quy"
 *  7. Admissions  — "06 PHƯƠNG THỨC XÉT TUYỂN ĐỂ TRỞ THÀNH SINH VIÊN TTU"
 *  8. Scholarships— "HỌC BỔNG TUYỂN SINH 2026"
 *  9. Partners    — "Kết nối mạng lưới toàn cầu"
 * 10. Announcements — "THÔNG BÁO CHUNG MỚI NHẤT"
 * 11. News        — "TIN TỨC VÀ SỰ KIỆN MỚI NHẤT"
 * 12. Registration — "Đăng ký tư vấn nhận tuyển sinh"
 * 13. Footer      — in [locale]/layout.tsx via @ttu/design-system
 *
 * Design tokens (color, gradient, shadow, typography) are defined in
 *   apps/web/src/styles/globals.css
 * and mapped into Tailwind utilities in
 *   apps/web/tailwind.config.ts
 * Source of truth: Figma Variables panel of `Fekw3aQtCfQbHq2aoho859`.
 */
import type { ComponentType } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Locale } from "@ttu/shared";
import { HOME_IMAGES } from "@/lib/figma-images";
import { RegistrationForm } from "./RegistrationForm";
import StatsVector from "@/components/home/decorations/stats-vector";
import AdmissionsVector from "@/components/home/decorations/admissions-vector";
import ScholarshipsVector from "@/components/home/decorations/scholarships-vector";
import WhyTtuIcon1 from "@/components/home/icons/why-ttu-1";
import WhyTtuIcon2 from "@/components/home/icons/why-ttu-2";
import WhyTtuIcon3 from "@/components/home/icons/why-ttu-3";
import WhyTtuIcon4 from "@/components/home/icons/why-ttu-4";
import WhyTtuIcon5 from "@/components/home/icons/why-ttu-5";
import ScholarshipIcon1 from "@/components/home/icons/scholarship-1";
import ScholarshipIcon2 from "@/components/home/icons/scholarship-2";
import ScholarshipIcon3 from "@/components/home/icons/scholarship-3";
import ScholarshipIcon4 from "@/components/home/icons/scholarship-4";
import FacultyIcon1 from "@/components/home/icons/faculty-1";
import FacultyIcon2 from "@/components/home/icons/faculty-2";
import FacultyIcon3 from "@/components/home/icons/faculty-3";
import FacultyIcon4 from "@/components/home/icons/faculty-4";
import FacultyIcon5 from "@/components/home/icons/faculty-5";
import FacultyIcon6 from "@/components/home/icons/faculty-6";
import FacultyIcon7 from "@/components/home/icons/faculty-7";

// ─── Section heading with accent bar (matches Figma "Frame 16" pattern) ─────────

function SectionHeading({
  title,
  eyebrow,
  description,
  white = false,
}: {
  title: string;
  eyebrow?: string;
  description?: string;
  white?: boolean;
}) {
  const descColor = white ? "text-ttu-white/70" : "text-muted-foreground";
  return (
    <div className="text-left">
      {eyebrow && (
        <p
          className={`mb-2 text-sm font-medium uppercase tracking-wider ${white ? "text-ttu-white/80" : "text-primary"}`}
        >
          {eyebrow}
        </p>
      )}
      <div className="flex items-start gap-4">
        {/* Accent bar — matches Figma "Frame 16" */}
        <div className="flex flex-col items-center shrink-0 mt-1">
          <div className="w-1 h-6 bg-ttu-white rounded-sm" />
          <div className="w-1 h-5 bg-orange rounded-sm mt-0.5" />
        </div>
        <h2
          className={`font-bold tracking-tight leading-tight font-heading ${white ? "text-ttu-white" : "text-foreground"} text-section`}
        >
          {title}
        </h2>
      </div>
      {description && (
        <p
          className={`mt-4 max-w-2xl text-body-base leading-relaxed ${descColor}`}
        >
          {description}
        </p>
      )}
    </div>
  );
}

// ─── Orange CTA button (matches Figma) ─────────────────────────────────────────

function OrangeButton({
  children,
  href = "#",
  className = "",
}: {
  children: React.ReactNode;
  href?: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`
        inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-button text-ttu-white
        transition-transform active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange focus-visible:ring-offset-2
        bg-ttu-gradient-cta
        ${className}
      `}
    >
      {children}
    </Link>
  );
}

// ─── Section 1: Hero ──────────────────────────────────────────────────────────

function HeroSection({ locale }: { locale: Locale }) {
  return (
    <section
      className="relative w-full"
      style={{ minHeight: "clamp(560px, 75vh, 700px)" }}
    >
      {/* Background image — Figma node 1387:181554 */}
      <div className="absolute inset-0">
        <Image
          src={HOME_IMAGES.hero}
          alt="Trường Đại học Tân Tạo"
          fill
          className="object-cover object-center"
          priority
          sizes="100vw"
        />
        {/* Gradient overlay — Figma node 1387:181554 (Frame 732)
            -43.4deg, rgba(45,46,131,0.8) 22.9% → rgba(0,141,54,0.72) 78.7% */}
        <div className="absolute inset-0 bg-ttu-gradient-hero-overlay" />
      </div>

      {/* Hero content */}
      <div className="relative z-10 mx-auto w-full px-6 lg:px-8 max-w-7xl">
        <div
          className="flex flex-col justify-center"
          style={{
            paddingTop: "clamp(80px, 12vh, 140px)",
            paddingBottom: "clamp(48px, 8vh, 80px)",
          }}
        >
          {/* Title — "From Knowledge to the Stars" — Figma node 1387:181554 */}
          <div className="max-w-2xl">
            <div className="flex items-start gap-4 mb-4">
              <div className="flex flex-col items-center shrink-0 mt-1">
                <div className="w-[4px] h-[58px] bg-white rounded-sm" />
                <div className="w-[4px] h-[38px] bg-orange rounded-sm mt-0.5" />
              </div>
              <h1 className="text-ttu-white font-bold leading-[50px] tracking-tight font-heading text-[40px] uppercase">
                From Knowledge
                <br />
                to the Stars
              </h1>
            </div>

            {/* Subtitle */}
            <p className="ml-6 w-[435px] text-ttu-white/90 text-body-lg leading-relaxed">
              Tiên phong Giáo dục Khai phóng: Nơi tài năng Việt vươn tầm quốc tế
            </p>

            {/* CTA Button */}
            <div className="mt-8 ml-6">
              <OrangeButton href={`/${locale}/tuyen-sinh/dang-ky`} className="gap-[10px] w-[262px]">
                Đăng ký xét tuyển ngay
                {/* Arrow icon */}
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  className="shrink-0"
                >
                  <path
                    d="M3 8h10M9 4l4 4-4 4"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </OrangeButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Section 2: Statistics ───────────────────────────────────────────────────
// Figma node 189:13315 (Frame 81) - 4 stats inside a green-to-navy gradient card.
// Heading column on the left + 809px gradient card on the right.
const STATS = [
  { value: "15", suffix: "+", lines: ["Năm kinh nghiệm", "đào tạo"] },
  {
    value: "10K",
    suffix: "+",
    lines: ["Sinh viên & Cựu", "sinh viên thành đạt"],
  },
  {
    value: "100",
    suffix: "%",
    lines: ["Tỷ lệ sinh viên có việc làm sau tốt nghiệp"],
  },
  {
    value: "80",
    suffix: "%",
    lines: ["Giảng viên tốt nghiệp từ các ĐH quốc tế"],
  },
];

function StatisticsSection() {
  return (
    <section
      className="relative overflow-hidden"
      style={{
        paddingTop: "clamp(40px, 6vh, 72px)",
        paddingBottom: "clamp(40px, 6vh, 72px)",
      }}
    >
      {/* Decorative vector - bottom right (Figma node 188:13224) */}
      <div
        className="absolute right-0 bottom-0 opacity-20 pointer-events-none"
        style={{ width: "clamp(200px, 25vw, 400px)" }}
      >
        <StatsVector className="w-full h-auto" />
      </div>

      <div className="mx-auto w-full px-6 lg:px-8 max-w-7xl">
        <div className="flex flex-col lg:flex-row items-start gap-[57px]">
          {/* Left: heading column - Figma node 188:13310 */}
          <div className="flex items-center gap-[17px] shrink-0">
            <div className="flex flex-col items-center justify-center shrink-0">
              <div className="bg-green-deep w-1 h-[58px] rounded-sm" />
              <div className="bg-orange w-1 h-[38px] rounded-sm mt-0.5" />
            </div>
            <h2 className="font-bold uppercase leading-[50px] tracking-tight text-[40px] text-green-deep w-[329px]">
              Những con số
              <br />
              ấn tượng
            </h2>
          </div>

          {/* Right: gradient card - Figma node 188:13223 */}
          <div className="bg-ttu-gradient-stat-card rounded-[20px] p-[30px] flex flex-col gap-[29px] items-start justify-center w-full lg:w-[809px] lg:max-w-[809px]">
            {STATS.map((stat) => (
              <div
                key={stat.value}
                className="content-stretch flex gap-[25px] h-[77px] items-center relative shrink-0 w-full"
              >
                {/* Number block - 150px wide, number 64px + suffix 32px */}
                <div className="flex items-start justify-end w-[150px] shrink-0 text-right whitespace-nowrap">
                  <span className="font-bold leading-normal text-[64px] text-ttu-white">
                    {stat.value}
                  </span>
                  <span className="leading-[40px] text-[32px] text-orange font-bold">
                    {stat.suffix}
                  </span>
                </div>
                {/* Label - 176px wide, 16px SemiBold white, multi-line */}
                <div className="font-semibold leading-normal text-[16px] text-ttu-white w-[176px] shrink-0 whitespace-pre-wrap">
                  {stat.lines.map((line, i) => (
                    <p key={i} className="mb-0">
                      {line}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Section 3: About — "Tấm vé thông hành" ────────────────────────────────

function AboutSection() {
  return (
    <section
      className="relative bg-ttu-white"
      style={{
        paddingTop: "clamp(48px, 8vh, 80px)",
        paddingBottom: "clamp(48px, 8vh, 80px)",
      }}
    >
      <div className="mx-auto w-full px-6 lg:px-8 max-w-7xl">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16 items-start">
          {/* Left: text content */}
          <div>
            <SectionHeading
              title="Tấm vé thông hành trở thành công dân toàn cầu"
              eyebrow="VỀ TTU"
            />
            <p className="mt-6 text-body-base leading-relaxed text-foreground/80">
              Trường Đại học Tân Tạo là trường đại học tư thục phi lợi nhuận
              theo mô hình của Mỹ tọa lạc trên diện tích 503 ha tại thành phố
              Tân Đức E.City, xã Đức Hòa, tỉnh Tây Ninh do Bà Đặng Thị Hoàng Yến
              (a.k.a Maya Dangelas) là người sáng lập và nhà tài trợ chính của
              Đại học Tân Tạo.
            </p>
            <p className="mt-3 text-body-base leading-relaxed text-foreground/80">
              Tại TTU, việc học tập suốt đời và phát huy năng lực tự thân luôn
              được đề cao và coi trọng. Sau khi tốt nghiệp, sinh viên sẽ có khả
              năng tự trang bị và không ngừng được nâng cao kiến thức để phù hợp
              với sự phát triển trong định hướng nghề nghiệp và yêu cầu chung
              của xã hội.
            </p>
            <div className="mt-8">
              <OrangeButton href="/gioi-thieu">
                Tìm hiểu thêm về chúng tôi
              </OrangeButton>
            </div>
          </div>

          {/* Right: image — Figma node 209:16851 (decorative) */}
          <div
            className="relative rounded-2xl overflow-hidden"
            style={{ aspectRatio: "4/3", minHeight: "320px" }}
          >
            <Image
              src={HOME_IMAGES.about}
              alt="Sinh viên TTU"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-ttu-gradient-primary-secondary opacity-60" />
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Section 4: Why TTU ──────────────────────────────────────────────────────

// Figma node 1275:174036 — 5 feature cards on top of a campus image background.
const WHY_TTU_FEATURES = [
  {
    title: "Tận hưởng không gian Anh ngữ",
    desc: '"Tắm mình trong Tiếng Anh" từ năm nhất. Đạt chuẩn IELTS 5.5+, TOEIC 620+ chỉ sau 1.5 năm học tập.',
    Icon: WhyTtuIcon1,
  },
  {
    title: "Môi trường học tập chuẩn Mỹ",
    desc: "Campus 103ha thuộc top rộng nhất phía Nam. Nằm trong hệ sinh thái Thành phố Tri thức E.City.",
    Icon: WhyTtuIcon2,
  },
  {
    title: "Tiếp cận triết lý Giáo dục Khai phóng",
    desc: "Đào tạo con người toàn diện, tôn trọng sự khác biệt và xây dựng tinh thần học tập suốt đời.",
    Icon: WhyTtuIcon3,
  },
  {
    title: "Quy mô lớp học lý tưởng",
    desc: "Chỉ 25 – 35 sinh viên/lớp, tối ưu tương tác giữa giảng viên và sinh viên.",
    Icon: WhyTtuIcon4,
  },
  {
    title: "Đặc quyền Khoa Y",
    desc: "Tiên phong thực tập tại Hoa Kỳ. Sinh viên trúng tuyển Bác sĩ Nội trú tại Việt Nam và Hoa Kỳ.",
    Icon: WhyTtuIcon5,
  },
];

function WhyTTUSection() {
  const f0 = WHY_TTU_FEATURES[0]!;
  const f1 = WHY_TTU_FEATURES[1]!;
  const f2 = WHY_TTU_FEATURES[2]!;
  const f3 = WHY_TTU_FEATURES[3]!;
  const f4 = WHY_TTU_FEATURES[4]!;
  return (
    <section
      className="relative overflow-hidden"
      style={{
        paddingTop: "clamp(48px, 8vh, 80px)",
        paddingBottom: "clamp(48px, 8vh, 80px)",
      }}
    >
      {/* Background card — Figma node 1275:174036 / 188:13299 (Rectangle 15) */}
      <div className="absolute inset-x-6 lg:inset-x-8 inset-y-0 mx-auto max-w-[1239px] rounded-[20px] overflow-hidden">
        <Image
          src={HOME_IMAGES.whyTtuBackground}
          alt=""
          fill
          className="object-cover"
          sizes="(max-width: 1239px) 100vw, 1239px"
        />
        <div className="absolute inset-0 bg-green-deep/90" />
      </div>

      {/* Inset photo — Figma node 1275:174036 / 189:13316 (right column) */}
      <div
        className="absolute right-6 lg:right-8 top-[200px] hidden lg:block overflow-hidden rounded-l-2xl"
        style={{ width: "clamp(280px, 38vw, 600px)", aspectRatio: "749/358" }}
      >
        <Image
          src={HOME_IMAGES.whyTtuPhoto}
          alt="Sinh viên TTU"
          fill
          className="object-cover"
          sizes="50vw"
        />
      </div>

      <div className="relative mx-auto w-full px-6 lg:px-8 max-w-7xl">
        <div className="flex items-start gap-4 max-w-3xl">
          <div className="flex flex-col items-center shrink-0 mt-1">
            <div className="w-1 h-12 bg-green-light rounded-sm" />
            <div className="w-1 h-8 bg-orange rounded-sm mt-1" />
          </div>
          <h2 className="text-ttu-white font-bold tracking-tight leading-tight font-heading text-section">
            Tại sao ĐẠI HỌC TÂN TẠO là lựa chọn khác biệt?
          </h2>
        </div>

        {/* 5 feature cards — Figma Frame 90 / 91 / 92 */}
        <div className="mt-10 grid gap-4 lg:gap-6 max-w-3xl">
          <div className="grid gap-4 sm:grid-cols-2 lg:gap-6">
            <FeatureCard title={f0.title} desc={f0.desc} Icon={f0.Icon} />
            <FeatureCard title={f1.title} desc={f1.desc} Icon={f1.Icon} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:gap-6">
            <FeatureCard title={f2.title} desc={f2.desc} Icon={f2.Icon} />
            <FeatureCard title={f3.title} desc={f3.desc} Icon={f3.Icon} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:gap-6">
            <FeatureCard title={f4.title} desc={f4.desc} Icon={f4.Icon} />
          </div>
        </div>
      </div>
    </section>
  );
}

function FeatureCard({
  title,
  desc,
  Icon,
}: {
  title: string;
  desc: string;
  Icon: ComponentType<{ className?: string }>;
}) {
  return (
    <div className="flex items-start gap-4 rounded-xl p-4 bg-green-deep/70 backdrop-blur-sm">
      <div className="w-16 h-16 shrink-0 rounded-[15px] bg-green-deep flex items-center justify-center">
        <Icon className="w-10 h-10 text-ttu-white" />
      </div>
      <div>
        <h3 className="font-bold leading-tight text-ttu-white text-h2">
          {title}
        </h3>
        <p className="mt-1 text-ttu-white/80 text-body-sm leading-relaxed">
          {desc}
        </p>
      </div>
    </div>
  );
}

// ─── Section 5: Training Systems ──────────────────────────────────────────────

function TrainingSection() {
  return (
    <section
      className="relative bg-muted"
      style={{
        paddingTop: "clamp(48px, 8vh, 80px)",
        paddingBottom: "clamp(48px, 8vh, 80px)",
      }}
    >
      <div className="mx-auto w-full px-6 lg:px-8 max-w-7xl">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16 items-center">
          {/* Left: text */}
          <div>
            <SectionHeading title="Các hệ đào tạo" eyebrow="HỆ ĐÀO TẠO" />
            <p className="mt-6 text-body-base leading-relaxed text-foreground/80">
              TTU cung cấp đa dạng hệ đào tạo từ chính quy đến liên kết quốc tế,
              đáp ứng mọi nhu cầu học tập của thí sinh và sinh viên.
            </p>
            <div className="mt-8">
              <OrangeButton href="/dao-tao">
                Khám phá các hệ đào tạo
              </OrangeButton>
            </div>
          </div>

          {/* Right: image grid — Figma node 190:13321 (Frame 98) */}
          <div className="grid grid-cols-2 gap-4 lg:gap-5">
            {[
              {
                src: HOME_IMAGES.trainingChinhQuy,
                alt: "Hệ chính quy",
                tag: "CHÍNH QUY",
                desc: "Chương trình đào tạo đại học tập trung dành cho học sinh đã tốt nghiệp THPT. Sinh viên học tập toàn thời gian tại trường để nhận bằng Cử nhân hoặc Bác sĩ.",
              },
              {
                src: HOME_IMAGES.trainingSauDaiHoc,
                alt: "Hệ sau đại học",
                tag: "HỆ SAU ĐẠI HỌC",
                desc: "Chương trình đào tạo bậc Thạc sĩ dành cho người đã tốt nghiệp đại học, nhằm cung cấp kiến thức chuyên môn sâu và nâng cao năng lực nghiên cứu.",
              },
              {
                src: HOME_IMAGES.trainingVanBang2,
                alt: "Hệ văn bằng 2",
                tag: "HỆ VĂN BẰNG 2",
                desc: "Chương trình đào tạo cấp bằng đại học thứ hai, dành cho những cá nhân đã sở hữu ít nhất một bằng đại học và muốn học thêm một ngành chuyên môn khác.",
              },
              {
                src: HOME_IMAGES.trainingLienThong,
                alt: "Hệ liên thông",
                tag: "HỆ LIÊN THÔNG",
                desc: "Chương trình đào tạo tiếp nối dành cho người đã tốt nghiệp trình độ Trung cấp hoặc Cao đẳng, nhằm bổ sung kiến thức để nhận bằng tốt nghiệp trình độ Đại học.",
              },
            ].map((card) => (
              <div key={card.alt} className="group">
                <div
                  className="relative rounded-[15px] overflow-hidden"
                  style={{ aspectRatio: "289/168" }}
                >
                  <Image
                    src={card.src}
                    alt={card.alt}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 1024px) 50vw, 25vw"
                  />
                </div>
                <div className="mt-3 flex flex-col gap-2">
                  <span className="font-bold leading-tight font-heading text-h2 text-green-light">
                    {card.tag}
                  </span>
                  <p className="text-body-sm leading-relaxed text-green-text max-w-[264px]">
                    {card.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Section 6: Programs — 7 khoa đào tạo ──────────────────────────────
// Figma node 190:13394 (Frame 106) — 7 faculty cards on a #ECECEC background.
// Each card = 64×64 icon block + khoa name + ngành list.

const PROGRAMS = [
  {
    faculty: "Khoa Y",
    majors: ["Y đa khoa"],
    href: "https://tuyensinh.ttu.edu.vn/y-khoa",
    Icon: FacultyIcon1,
  },
  {
    faculty: "Khoa Công nghệ thông tin",
    majors: [
      "Khoa học máy tính",
      "Khoa học dữ liệu",
      "Trí tuệ nhân tạo",
      "Công nghệ thông tin",
    ],
    Icon: FacultyIcon2,
  },
  {
    faculty: "Khoa Công nghệ sinh học",
    majors: ["Công nghệ sinh học", "Nông nghiệp công nghệ cao"],
    Icon: FacultyIcon3,
  },
  {
    faculty: "Khoa Ngôn ngữ",
    majors: ["Ngôn ngữ Anh", "Ngôn ngữ Trung Quốc", "Ngôn ngữ Hàn Quốc"],
    Icon: FacultyIcon4,
  },
  {
    faculty: "Khoa Kinh tế và Quản trị Kinh doanh",
    majors: [
      "Kinh doanh quốc tế",
      "Quản trị kinh doanh",
      "Kế toán",
      "Tài chính – Ngân hàng",
      "Digital Marketing",
      "Logistic và Quản lý chuỗi cung ứng",
      "Truyền thông đa phương tiện",
      "Luật Kinh tế",
      "Luật",
    ],
    Icon: FacultyIcon5,
  },
  {
    faculty: "Khoa Nhân văn và Giáo dục Khai phóng",
    majors: [],
    href: "https://ttu.edu.vn/khoa-nhan-van-va-giao-duc-khai-phong/",
    Icon: FacultyIcon6,
  },
  {
    faculty: "Khoa Điều dưỡng & Kỹ thuật Xét nghiệm Y học",
    majors: ["Điều dưỡng", "Kỹ thuật xét nghiệm"],
    Icon: FacultyIcon7,
  },
];

function ProgramsSection() {
  const p0 = PROGRAMS[0]!;
  const p1 = PROGRAMS[1]!;
  const p2 = PROGRAMS[2]!;
  const p3 = PROGRAMS[3]!;
  const p4 = PROGRAMS[4]!;
  const p5 = PROGRAMS[5]!;
  const p6 = PROGRAMS[6]!;
  return (
    <section
      className="relative overflow-hidden bg-ttu-gray-light"
      style={{
        paddingTop: "clamp(48px, 8vh, 70px)",
        paddingBottom: "clamp(48px, 8vh, 70px)",
      }}
    >
      <div className="mx-auto w-full px-6 lg:px-[147px] max-w-[1280px]">
        {/* Heading + intro */}
        <div className="max-w-[986px]">
          <div className="flex items-start gap-4">
            <div className="flex flex-col items-center shrink-0 mt-1">
              <div className="w-1 h-12 bg-green-deep rounded-sm" />
              <div className="w-1 h-8 bg-orange rounded-sm mt-1" />
            </div>
            <h2 className="text-green-deep font-bold tracking-tight leading-tight font-heading text-section uppercase">
              Chương trình đào tạo hệ chính quy
            </h2>
          </div>
          <p className="mt-5 max-w-[965px] text-body-lg leading-relaxed text-green-deep">
            "Trường Đại học Tân Tạo hiện có 7 Khoa đào tạo với 21 ngành và
            chuyên ngành khác nhau. Chương trình học tại TTU được thiết kế theo
            tiêu chuẩn giáo dục Hoa Kỳ, kết hợp mô hình Khai phóng giúp sinh
            viên phát triển toàn diện cả về kiến thức chuyên môn lẫn tư duy sáng
            tạo."
          </p>
          <div className="mt-6">
            <Link
              href="/dao-tao"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-button text-green-deep border border-green-deep hover:bg-green-deep hover:text-ttu-white transition-colors"
            >
              Xem toàn bộ chương trình đào tạo
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                className="shrink-0"
              >
                <path
                  d="M3 8h10M9 4l4 4-4 4"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
          </div>
        </div>

        {/* Faculty cards — 3 columns × 2 rows + 1 centered (matches Frame 102/103/104) */}
        <div className="mt-12 flex flex-col gap-[30px] items-start">
          <div className="grid gap-x-[93px] gap-y-5 sm:grid-cols-2 lg:grid-cols-3 w-full justify-items-center">
            {[p0, p1, p2].map((p) => (
              <FacultyCard key={p.faculty} {...p} />
            ))}
          </div>
          <div className="grid gap-x-[93px] gap-y-5 sm:grid-cols-2 lg:grid-cols-3 w-full justify-items-center">
            {[p3, p4, p5].map((p) => (
              <FacultyCard key={p.faculty} {...p} />
            ))}
          </div>
          <div className="grid gap-x-[93px] gap-y-5 sm:grid-cols-2 lg:grid-cols-3 w-full justify-items-center">
            <FacultyCard {...p6} />
          </div>
        </div>
      </div>
    </section>
  );
}

function FacultyCard({
  faculty,
  majors,
  href,
  Icon,
}: {
  faculty: string;
  majors: string[];
  href?: string;
  Icon: ComponentType<{ className?: string }>;
}) {
  const inner = (
    <>
      <div className="w-16 h-16 rounded-[15px] bg-green-deep flex items-center justify-center">
        <Icon className="w-10 h-10 text-ttu-white" />
      </div>
      <h3 className="mt-5 font-bold leading-tight text-green-deep text-button">
        {faculty}
      </h3>
      {majors.length > 0 && (
        <p className="mt-2 text-body-sm leading-relaxed text-green-deep">
          {majors.map((m, i) => (
            <span key={m}>
              {m}
              {i < majors.length - 1 ? <br /> : null}
            </span>
          ))}
        </p>
      )}
    </>
  );

  const className = "flex flex-col items-start w-[265px]";
  if (href) {
    return (
      <Link
        href={href}
        className={`${className} hover:opacity-80`}
        target="_blank"
      >
        {inner}
      </Link>
    );
  }
  return <div className={className}>{inner}</div>;
}

// ─── Section 7: Admissions ───────────────────────────────────────────────────
// Figma node 457:49664 (Group 11) — 6 phương thức xét tuyển trên ảnh nền
// image 9 + dark green overlay. Cards = mã số cam + nội dung trắng.
const ADMISSIONS_METHODS = [
  {
    code: "301",
    title: "Xét tuyển thẳng theo quy định của Quy chế tuyển sinh",
    desc: "Áp dụng xét tuyển thẳng theo quy định (Điều 8) của Bộ Giáo dục và Đào tạo.",
  },
  {
    code: "100",
    title: "Xét kết quả thi tốt nghiệp THPT",
    desc: "Tổng điểm 03 môn thi theo tổ hợp xét tuyển đạt tối thiểu 15,00 điểm (trên thang điểm 30). Riêng chương trình đào tạo lĩnh vực Sức khỏe và lĩnh vực Pháp luật sẽ căn cứ theo ngưỡng đảm bảo chất lượng quy định bởi Bộ GD&ĐT.",
  },
  {
    code: "200",
    title: "Xét tuyển sử dụng kết quả học tập ở cấp THPT (Học bạ)",
    desc: "Xét điểm trung bình chung cả năm lớp 10, 11, 12 của tối thiểu 03 môn học; hoặc 02 môn kết hợp quy đổi điểm chứng chỉ ngoại ngữ. Đối với nhóm ngành Sức khỏe và Pháp luật, thí sinh cần đạt điều kiện bổ sung về học lực lớp 12.",
  },
  {
    code: "402",
    title: "Xét kết quả thi Đánh giá năng lực (ĐHQG TP.HCM) năm 2026",
    desc: "Sử dụng kết quả kỳ thi đánh giá năng lực do Đại học Quốc gia TP.HCM tổ chức. Cần đáp ứng ngưỡng đảm bảo chất lượng đầu vào.",
  },
  {
    code: "407",
    title: "Kết hợp kết quả thi tốt nghiệp THPT với kết quả học tập cấp THPT",
    desc: "Phương thức kết hợp giữa điểm thi tốt nghiệp và điểm học bạ. Thí sinh cần đáp ứng ngưỡng đảm bảo chất lượng đầu vào riêng của Nhà trường.",
  },
  {
    code: "1411",
    title: "Xét tuyển thí sinh tốt nghiệp THPT nước ngoài",
    desc: "Phương thức dành riêng để xét tuyển các thí sinh đã tốt nghiệp chương trình THPT ở nước ngoài.",
  },
];

function AdmissionsSection() {
  return (
    <section
      className="relative overflow-hidden"
      style={{
        paddingTop: "clamp(48px, 8vh, 80px)",
        paddingBottom: "clamp(48px, 8vh, 80px)",
        minHeight: "clamp(800px, 90vh, 1118px)",
      }}
    >
      {/* Background image — Figma node 457:49664 / 340:13512 (image 9) */}
      <div className="absolute inset-0">
        <Image
          src={HOME_IMAGES.admissionsBackground}
          alt=""
          fill
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-[rgba(0,34,21,0.7)]" />
      </div>

      {/* Decorative vector — Figma 346:13801 */}
      <div
        className="absolute pointer-events-none hidden lg:block overflow-hidden"
        style={{
          right: "-15%",
          top: "5%",
          width: "clamp(300px, 40vw, 600px)",
          aspectRatio: "384/335",
        }}
      >
        <AdmissionsVector className="w-full h-full text-ttu-white opacity-50" />
      </div>

      <div className="relative mx-auto w-full px-6 lg:px-[148px] max-w-[1280px]">
        {/* Heading — 2 lines, "06" + "PHƯƠNG THỨC XÉT TUYỂN" in orange */}
        <div className="max-w-[827px]">
          <div className="flex items-start gap-4">
            <div className="flex flex-col items-center shrink-0 mt-1">
              <div className="w-1 h-12 bg-ttu-white rounded-sm" />
              <div className="w-1 h-8 bg-orange rounded-sm mt-1" />
            </div>
            <h2 className="text-ttu-white font-bold tracking-tight leading-tight font-heading text-section uppercase">
              <span className="text-ttu-white">06 </span>
              <span className="text-orange">Phương thức xét tuyển </span>
              <br />
              để trở thành sinh viên ttu
            </h2>
          </div>
        </div>

        {/* 6 method cards in 2-col × 3-row grid — matches Figma Frame 161 */}
        <div className="mt-12 max-w-[617px] grid grid-cols-1 md:grid-cols-2 gap-4">
          {ADMISSIONS_METHODS.map((m) => (
            <MethodRow key={m.code} {...m} />
          ))}
        </div>
      </div>
    </section>
  );
}

function MethodRow({
  code,
  title,
  desc,
}: {
  code: string;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex items-stretch gap-5">
      <div className="bg-ttu-gradient-cta flex items-center justify-center rounded-[5px] w-[96px] shrink-0 p-2.5">
        <span className="font-bold leading-[30px] text-h2 text-center text-ttu-white whitespace-nowrap">
          {code}
        </span>
      </div>
      <div className="bg-ttu-white flex flex-col items-start justify-center rounded-[5px] flex-1 p-5">
        <p className="font-bold leading-snug text-button text-green-deep">
          {title}
        </p>
        <p className="mt-1 font-light leading-snug text-body-xs text-green-deep">
          {desc}
        </p>
      </div>
    </div>
  );
}

// ─── Section 8: Scholarships ─────────────────────────────────────────────────
// Figma node 1005:175084 (Frame 652) — 4 white cards on ảnh nền + gradient overlay.
const SCHOLARSHIPS = [
  {
    eyebrow: "Hơn",
    headline: "38 TỶ",
    tail: "từ Quỹ học bổng ITA",
    desc: "Trao 100 suất học bổng toàn phần cho học sinh có thành tích học tập tốt, khó khăn về tài chính.",
    Icon: ScholarshipIcon1,
  },
  {
    eyebrow: "Ưu đãi học phí",
    headline: "30-100%",
    tail: "năm đầu tiên",
    desc: "Áp dụng tất cả phương thức xét tuyển với ưu đãi từ 30%, 50%, 75% và 100% học phí (dựa trên điểm số đầu vào).",
    Icon: ScholarshipIcon2,
  },
  {
    eyebrow: "Hỗ trợ vay học phí",
    headline: "0%",
    tail: "lãi suất",
    desc: "Sinh viên từ năm thứ hai có cơ hội vay học phí 0% lãi suất, tối đa 50% học phí mỗi học kỳ.",
    Icon: ScholarshipIcon3,
  },
  {
    eyebrow: "Cam kết",
    headline: "HỌC PHÍ",
    tail: "học phí toàn khóa không tăng",
    desc: "Trao 100 suất học bổng toàn phần cho học sinh có thành tích học tập tốt, khó khăn về tài chính.",
    Icon: ScholarshipIcon4,
  },
];

function ScholarshipsSection() {
  return (
    <section
      className="relative overflow-hidden"
      style={{
        paddingTop: "clamp(48px, 8vh, 80px)",
        paddingBottom: "clamp(48px, 8vh, 80px)",
        minHeight: "clamp(420px, 50vh, 597px)",
      }}
    >
      {/* Background image — Figma node 1005:175084 / 475:46778 (Rectangle 8) */}
      <div className="absolute inset-0">
        <Image
          src={HOME_IMAGES.scholarship}
          alt=""
          fill
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-ttu-gradient-hero-overlay" />
      </div>

      {/* Decorative vector — Figma node 346:13569 */}
      <div
        className="absolute pointer-events-none hidden lg:block"
        style={{ right: "5%", bottom: 0, width: "clamp(200px, 20vw, 400px)" }}
      >
        <ScholarshipsVector className="w-full h-auto text-ttu-white opacity-10" />
      </div>

      <div className="relative mx-auto w-full px-6 lg:px-[84px] max-w-[1280px]">
        <div className="flex flex-col gap-[53px] items-center text-center">
          <div>
            <h2 className="text-ttu-white font-bold tracking-tight leading-[50px] font-heading uppercase text-section">
              Học bổng tuyển sinh 2026
            </h2>
            <p className="mt-2 text-ttu-white text-h2 font-bold leading-[30px]">
              Chắp cánh tài năng trẻ
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {SCHOLARSHIPS.map((s) => (
              <article
                key={s.headline}
                className="bg-ttu-white rounded-[15px] p-5 flex flex-col gap-2.5 items-start"
              >
                <div className="flex flex-col gap-1 text-green-deep">
                  <p className="text-body-sm leading-snug">{s.eyebrow}</p>
                  <p className="text-h2 font-bold leading-[30px]">
                    {s.headline}
                  </p>
                  <p className="text-body-sm leading-snug">{s.tail}</p>
                </div>
                <div className="w-16 h-16 rounded-[15px] bg-green-deep flex items-center justify-center">
                  <s.Icon className="w-10 h-10 text-ttu-white" />
                </div>
                <p className="font-light text-body-xs leading-snug text-green-deep min-h-[82px]">
                  {s.desc}
                </p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Section 9: Partners ──────────────────────────────────────────────────────
// Figma node 204:16456 (Frame 131) — heading + horizontal logo strip
// (Frame 683–686 instances repeated 4× for marquee effect).
const PARTNERS = [
  { name: "Rice University", country: "Hoa Kỳ", logo: HOME_IMAGES.partner1 },
  { name: "NTU Singapore", country: "Singapore", logo: HOME_IMAGES.partner2 },
  {
    name: "University of Queensland",
    country: "Úc",
    logo: HOME_IMAGES.partner3,
  },
  { name: "University of Leeds", country: "Anh", logo: HOME_IMAGES.partner4 },
];

function PartnersSection() {
  // Duplicate to create seamless marquee illusion (4× per Figma Frame 700)
  const strip = [...PARTNERS, ...PARTNERS, ...PARTNERS, ...PARTNERS];

  return (
    <section
      className="relative overflow-hidden bg-ttu-white"
      style={{
        paddingTop: "clamp(48px, 8vh, 80px)",
        paddingBottom: "clamp(48px, 8vh, 80px)",
      }}
    >
      {/* Bottom accent bar — Figma 1275:174037 (Rectangle 16/17) */}
      <div className="absolute bottom-0 left-0 right-0 flex h-[13px] pointer-events-none">
        <div className="flex-1 bg-orange" />
        <div className="flex-1 bg-green-light" />
      </div>

      <div className="mx-auto w-full px-6 lg:px-8 max-w-7xl">
        <SectionHeading
          title="Kết nối mạng lưới toàn cầu"
          eyebrow="ĐỐI TÁC CHIẾN LƯỢC"
        />

        <div
          className="mt-10 flex gap-6 overflow-x-auto pb-4"
          style={{ scrollbarWidth: "none" }}
        >
          {strip.map((p, i) => (
            <div
              key={`${p.name}-${i}`}
              className="shrink-0 w-[264px] flex flex-col items-center justify-center rounded-xl p-6 text-center border border-border hover:border-primary/30 hover:shadow-ttu-500 transition-all bg-ttu-white"
            >
              <div className="relative w-14 h-14 mb-3">
                <Image
                  src={p.logo}
                  alt={p.name}
                  fill
                  className="object-contain"
                  sizes="56px"
                />
              </div>
              <div className="font-semibold text-foreground leading-tight text-body-sm">
                {p.name}
              </div>
              <div className="text-body-xs text-muted-foreground mt-1">
                {p.country}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Section 10: Announcements ───────────────────────────────────────────────
// Figma node 204:16682 (Frame 144) — green→navy gradient background, 1 featured
// card (240×240 image + 600w text) + 4 thumbnail cards (150×150 + text).
const ANNOUNCEMENTS = [
  {
    img: HOME_IMAGES.announcementFeatured,
    title: 'NGÀNH HỌC "TRIỆU ĐÔ" CHO 2k8 MÊ GREEN-TECH: NÔNG NGHIỆP',
    desc: "Mục đích: Hỗ trợ vay cho sinh viên TTU có hoàn cảnh gia đình khó khăn.",
    featured: true,
  },
  {
    img: HOME_IMAGES.announcementThumb,
    title: 'NGÀNH HỌC "TRIỆU ĐÔ" CHO 2k8 MÊ GREEN-TECH: NÔNG NGHIỆP',
    desc: "Mục đích: Hỗ trợ vay cho sinh viên TTU có hoàn cảnh gia đình khó khăn.",
  },
  {
    img: HOME_IMAGES.announcementThumb,
    title: 'NGÀNH HỌC "TRIỆU ĐÔ" CHO 2k8 MÊ GREEN-TECH: NÔNG NGHIỆP',
    desc: "Mục đích: Hỗ trợ vay cho sinh viên TTU có hoàn cảnh gia đình khó khăn.",
  },
  {
    img: HOME_IMAGES.announcementThumb,
    title: 'NGÀNH HỌC "TRIỆU ĐÔ" CHO 2k8 MÊ GREEN-TECH: NÔNG NGHIỆP',
    desc: "Mục đích: Hỗ trợ vay cho sinh viên TTU có hoàn cảnh gia đình khó khăn.",
  },
  {
    img: HOME_IMAGES.announcementThumb,
    title: 'NGÀNH HỌC "TRIỆU ĐÔ" CHO 2k8 MÊ GREEN-TECH: NÔNG NGHIỆP',
    desc: "Mục đích: Hỗ trợ vay cho sinh viên TTU có hoàn cảnh gia đình khó khăn.",
  },
];

function AnnouncementsSection() {
  const a0 = ANNOUNCEMENTS[0]!;
  const a1 = ANNOUNCEMENTS[1]!;
  const a2 = ANNOUNCEMENTS[2]!;
  const a3 = ANNOUNCEMENTS[3]!;
  const a4 = ANNOUNCEMENTS[4]!;
  return (
    <section
      className="relative overflow-hidden bg-ttu-gradient-primary-secondary-tb"
      style={{
        paddingTop: "clamp(48px, 8vh, 74px)",
        paddingBottom: "clamp(48px, 8vh, 74px)",
      }}
    >
      <div className="mx-auto w-full px-6 lg:px-[148px] max-w-[1280px]">
        {/* Heading */}
        <div className="max-w-[960px]">
          <div className="flex items-start gap-4">
            <div className="flex flex-col items-center shrink-0 mt-1">
              <div className="w-1 h-12 bg-ttu-white rounded-sm" />
              <div className="w-1 h-8 bg-orange rounded-sm mt-1" />
            </div>
            <h2 className="text-ttu-white font-bold tracking-tight leading-[50px] font-heading uppercase text-section">
              THÔNG BÁO CHUNG MỚI NHẤT
            </h2>
          </div>
        </div>

        {/* Featured announcement — Frame 137 */}
        <div className="mt-12">
          <FeaturedAnnouncement announcement={a0} />
        </div>

        {/* 4 smaller announcements — Frame 142 (2 rows × 2 cols) */}
        <div className="mt-10 flex flex-col gap-7">
          <div className="grid gap-x-[82px] gap-y-7 sm:grid-cols-2">
            <SmallAnnouncement announcement={a1} />
            <SmallAnnouncement announcement={a2} />
          </div>
          <div className="grid gap-x-[82px] gap-y-7 sm:grid-cols-2">
            <SmallAnnouncement announcement={a3} />
            <SmallAnnouncement announcement={a4} />
          </div>
        </div>
      </div>
    </section>
  );
}

function FeaturedAnnouncement({
  announcement,
}: {
  announcement: (typeof ANNOUNCEMENTS)[number];
}) {
  return (
    <Link
      href="/thong-bao"
      className="group flex items-center gap-[43px] hover:opacity-90 transition-opacity"
    >
      <div
        className="relative shrink-0 rounded-[15px] overflow-hidden"
        style={{ width: "240px", aspectRatio: "1" }}
      >
        <Image
          src={announcement.img}
          alt={announcement.title}
          fill
          className="object-cover"
          sizes="240px"
        />
      </div>
      <div className="flex flex-col gap-7 max-w-[600px]">
        <div className="flex flex-col gap-2">
          <h3 className="font-bold leading-[40px] text-h1 text-green-light">
            {announcement.title}
          </h3>
          <p className="text-body-sm leading-snug text-ttu-white max-w-[264px]">
            {announcement.desc}
          </p>
        </div>
        <span className="text-body-xs font-light bg-clip-text text-transparent bg-ttu-gradient-cta">
          Xem chi tiết &gt;&gt;
        </span>
      </div>
    </Link>
  );
}

function SmallAnnouncement({
  announcement,
}: {
  announcement: (typeof ANNOUNCEMENTS)[number];
}) {
  return (
    <Link
      href="/thong-bao"
      className="group flex items-start gap-[25px] hover:opacity-90 transition-opacity"
    >
      <div
        className="relative shrink-0 rounded-[10px] overflow-hidden"
        style={{ width: "150px", height: "150px" }}
      >
        <Image
          src={announcement.img}
          alt={announcement.title}
          fill
          className="object-cover"
          sizes="150px"
        />
      </div>
      <div className="flex flex-col gap-2 max-w-[264px]">
        <h3 className="font-semibold leading-snug text-button text-green-light">
          {announcement.title}
        </h3>
        <p className="font-light leading-snug text-body-xs text-ttu-white">
          {announcement.desc}
        </p>
        <span className="text-[8px] font-light bg-clip-text text-transparent bg-ttu-gradient-cta">
          Xem chi tiết &gt;&gt;
        </span>
      </div>
    </Link>
  );
}

// ─── Section 11: News ────────────────────────────────────────────────────────
// Figma node 204:16766 (Frame 149) — heading + 3 Frame 93/145/146 instances.
const NEWS = [
  {
    img: HOME_IMAGES.news1,
    category: "Hợp tác quốc tế",
    title: "TTU ký kết hợp tác với Đại học Rice (Hoa Kỳ)",
    date: "2026-09-06",
    excerpt:
      "Chương trình liên kết đào tạo quốc tế chính thức được công bố với nhiều học bổng cho sinh viên TTU.",
  },
  {
    img: HOME_IMAGES.news2,
    category: "Cơ sở vật chất",
    title: "Khánh thành Trung tâm Mô phỏng Y khoa thế hệ mới",
    date: "2026-09-04",
    excerpt:
      "Trung tâm đầu tiên tại Việt Nam đạt chuẩn quốc tế phục vụ đào tạo Bác sĩ và Điều dưỡng.",
  },
  {
    img: HOME_IMAGES.news3,
    category: "Thành tích sinh viên",
    title: "Sinh viên TTU đạt giải Nhất cuộc thi AI quốc gia 2026",
    date: "2026-08-30",
    excerpt:
      "Đội tuyển Khoa Công nghệ vượt qua hơn 200 đội từ 30 trường đại học trên cả nước.",
  },
];

function NewsSection() {
  return (
    <section
      className="relative bg-ttu-white"
      style={{
        paddingTop: "clamp(48px, 8vh, 70px)",
        paddingBottom: "clamp(48px, 8vh, 70px)",
      }}
    >
      <div className="mx-auto w-full px-6 lg:px-8 max-w-7xl">
        <SectionHeading title="TIN TỨC VÀ SỰ KIỆN MỚI NHẤT" eyebrow="TIN TỨC" />

        <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {NEWS.map((n) => (
            <Link
              key={n.title}
              href="/tin-tuc"
              className="group rounded-2xl overflow-hidden border border-border hover:shadow-ttu-500 transition-shadow"
            >
              <div className="relative" style={{ aspectRatio: "362/310" }}>
                <Image
                  src={n.img}
                  alt={n.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                <div className="absolute top-3 left-3 px-2 py-1 rounded text-body-xs font-semibold text-ttu-white bg-green-light">
                  {n.category}
                </div>
              </div>
              <div className="p-5">
                <time className="text-body-xs text-muted-foreground">
                  {new Date(n.date).toLocaleDateString("vi-VN")}
                </time>
                <h3 className="mt-2 font-bold text-foreground leading-tight line-clamp-2 font-heading text-button">
                  {n.title}
                </h3>
                <p className="mt-2 text-body-sm text-muted-foreground leading-relaxed line-clamp-2">
                  {n.excerpt}
                </p>
                <span className="mt-3 inline-flex items-center gap-1 text-body-sm font-medium text-primary">
                  Xem chi tiết →
                </span>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-8 text-center">
          <OrangeButton href="/tin-tuc">Xem tất cả tin tức</OrangeButton>
        </div>
      </div>
    </section>
  );
}

// ─── Section 12: Registration ────────────────────────────────────────────────

function RegistrationSection() {
  return (
    <section
      className="relative overflow-hidden bg-ttu-gradient-primary-secondary"
      style={{
        paddingTop: "clamp(60px, 10vh, 100px)",
        paddingBottom: "clamp(60px, 10vh, 100px)",
      }}
    >
      <div className="mx-auto w-full px-6 lg:px-8 max-w-7xl">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
          {/* Left: form */}
          <div>
            <SectionHeading
              white
              title="Đăng ký tư vấn nhận tuyển sinh"
              eyebrow="ĐĂNG KÝ NGAY"
              description="Chương trình được thực hiện từ Quỹ ITA Vì Tương Lai dành cho sinh viên có hoàn cảnh khó khăn, nhằm giúp các bạn tiếp tục theo học."
            />
            <RegistrationForm />
          </div>

          {/* Right: decorative image — reuse hero asset since Figma node 204:16769 has no raster */}
          <div
            className="relative rounded-2xl overflow-hidden hidden lg:block"
            style={{ aspectRatio: "4/3" }}
          >
            <Image
              src={HOME_IMAGES.hero}
              alt="Tư vấn tuyển sinh TTU"
              fill
              className="object-cover"
              sizes="50vw"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Main export ─────────────────────────────────────────────────────────────

export function HomePage({ locale }: { locale: Locale }) {
  return (
    <>
      <HeroSection locale={locale} />
      <StatisticsSection />
      <AboutSection />
      <WhyTTUSection />
      <TrainingSection />
      <ProgramsSection />
      <ScholarshipsSection />
      <AdmissionsSection />
      <PartnersSection />
      <AnnouncementsSection />
      <NewsSection />
      <RegistrationSection />
    </>
  );
}
