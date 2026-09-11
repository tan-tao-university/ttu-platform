/**
 * TTU Homepage — built to match Figma design exactly.
 *
 * Sections (top to bottom): 1. Hero — full-width campus image + gradient + title + CTA 2. About —
 * "Tấm vé thông hành trở thành công dân toàn cầu" 3. Statistics — "Những con số ấn tượng" 4. Why
 * TTU — "Tại sao ĐẠI HỌC TÂN TẠO là lựa chọn khác biệt?" 5. Training — "Các hệ đào tạo" 6. Programs
 * — "Chương trình đào tạo hệ chính quy" 7. Admissions — "06 PHƯƠNG THỨC XÉT TUYỂN ĐỂ TRỞ THÀNH SINH
 * VIÊN TTU" 8. Scholarships— "HỌC BỔNG TUYỂN SINH 2026" 9. Partners — "Kết nối mạng lưới toàn cầu"
 * 10. Announcements — "THÔNG BÁO CHUNG MỚI NHẤT" 11. News — "TIN TỨC VÀ SỰ KIỆN MỚI NHẤT" 12.
 * Registration — "Đăng ký tư vấn nhận tuyển sinh" 13. Footer — in [locale]/layout.tsx via
 *
 * Shared layout components come from `@ttu/design-system`.
 *
 * Design tokens (color, gradient, shadow, typography) are defined in
 * apps/web/src/styles/globals.css and mapped into Tailwind utilities in apps/web/tailwind.config.ts
 * Source of truth: Figma Variables panel of `Fekw3aQtCfQbHq2aoho859`.
 */
import type { ComponentType } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Locale } from '@ttu/shared';
import { HOME_IMAGES } from '@/lib/figma-images';
import { RegistrationForm } from './RegistrationForm';
import StatsVector from '@/components/home/decorations/stats-vector';
import AdmissionsVector from '@/components/home/decorations/admissions-vector';
import ScholarshipsVector from '@/components/home/decorations/scholarships-vector';
import WhyTtuIcon1 from '@/components/home/icons/why-ttu-1';
import WhyTtuIcon2 from '@/components/home/icons/why-ttu-2';
import WhyTtuIcon3 from '@/components/home/icons/why-ttu-3';
import WhyTtuIcon4 from '@/components/home/icons/why-ttu-4';
import WhyTtuIcon5 from '@/components/home/icons/why-ttu-5';
import ScholarshipIcon1 from '@/components/home/icons/scholarship-1';
import ScholarshipIcon2 from '@/components/home/icons/scholarship-2';
import ScholarshipIcon3 from '@/components/home/icons/scholarship-3';
import ScholarshipIcon4 from '@/components/home/icons/scholarship-4';
import FacultyIcon1 from '@/components/home/icons/faculty-1';
import FacultyIcon2 from '@/components/home/icons/faculty-2';
import FacultyIcon3 from '@/components/home/icons/faculty-3';
import FacultyIcon4 from '@/components/home/icons/faculty-4';
import FacultyIcon5 from '@/components/home/icons/faculty-5';
import FacultyIcon6 from '@/components/home/icons/faculty-6';
import FacultyIcon7 from '@/components/home/icons/faculty-7';

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
  const descColor = white ? 'text-ttu-white/70' : 'text-muted-foreground';
  return (
    <div className="text-left">
      {eyebrow && (
        <p
          className={`mb-2 text-sm font-medium uppercase tracking-wider ${white ? 'text-ttu-white/80' : 'text-primary'}`}
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
          className={`font-bold tracking-tight leading-tight font-heading ${white ? 'text-ttu-white' : 'text-foreground'} text-section`}
        >
          {title}
        </h2>
      </div>
      {description && (
        <p className={`mt-4 max-w-2xl text-body-base leading-relaxed ${descColor}`}>
          {description}
        </p>
      )}
    </div>
  );
}

// ─── Orange CTA button (matches Figma) ─────────────────────────────────────────

function OrangeButton({
  children,
  href = '#',
  className = '',
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
    <section className="relative h-[597px] w-full overflow-hidden max-md:h-auto max-md:min-h-[560px]">
      {/* Background image — Figma node 1387:181554 */}
      <div className="absolute inset-0">
        <Image
          src={HOME_IMAGES.hero}
          alt="Trường Đại học Tân Tạo"
          fill
          className="object-cover object-center"
          priority
          sizes="100vw"
          unoptimized
        />
        {/* Gradient overlay — Figma node 1387:181554 (Frame 732)
            -43.4deg, rgba(45,46,131,0.8) 22.9% → rgba(0,141,54,0.72) 78.7% */}
        <div className="absolute inset-0 bg-ttu-gradient-hero-overlay" />
      </div>

      <div className="pointer-events-none absolute inset-0 mx-auto hidden h-full w-full max-w-[1280px] overflow-hidden lg:block">
        <AdmissionsVector className="absolute left-[940px] top-[262px] h-[335px] w-[384px]" />
      </div>

      {/* Hero content */}
      <div className="relative z-10 mx-auto flex h-full w-full max-w-[1280px] flex-col px-6 pb-12 pt-14 max-md:h-auto max-md:px-6 max-md:py-20 lg:px-[140px] lg:pb-[61px] lg:pt-[58px]">
        <div className="flex w-full flex-col gap-[258px] max-md:gap-24 lg:w-[675px]">
          {/* Title — "From Knowledge to the Stars" — Figma node 1387:181554 */}
          <div className="flex w-full flex-col gap-[5px]">
            <div className="w-full p-[10px]">
              <div className="flex w-full items-center gap-[17px]">
                <div className="flex shrink-0 flex-col items-center justify-center">
                  <div className="h-[58px] w-[4px] bg-white" />
                  <div className="h-[38px] w-[4px] bg-orange" />
                </div>
                <h1 className="w-full text-[40px] font-bold uppercase leading-[50px] text-ttu-white max-md:text-[32px] max-md:leading-[40px]">
                  From Knowledge to
                  <br />
                  the Stars
                </h1>
              </div>
            </div>

            {/* Subtitle */}
            <p className="w-[435px] text-[18px] leading-normal text-ttu-white max-md:w-full">
              Tiên phong Giáo dục Khai phóng: Nơi tài năng Việt vươn tầm quốc tế
            </p>
          </div>

          {/* CTA Button */}
          <OrangeButton
            href={`/${locale}/tuyen-sinh/dang-ky`}
            className="h-[43px] w-[262px] gap-[10px] px-5"
          >
            <span className="flex-1">Đăng ký xét tuyển ngay</span>
            <span
              aria-hidden="true"
              className="flex h-6 w-5 shrink-0 items-center justify-end py-0.5"
            >
              <Image
                src={HOME_IMAGES.heroArrow}
                alt=""
                width={17}
                height={19}
                className="h-[19px] w-[17px]"
              />
            </span>
          </OrangeButton>
        </div>
      </div>
    </section>
  );
}

// ─── Section 2: Statistics ───────────────────────────────────────────────────
// Figma node 189:13315 (Frame 81) - 4 stats inside a green-to-navy gradient card.
// Heading column on the left + 809px gradient card on the right.
const STATS = [
  { value: '15', suffix: '+', lines: ['Năm kinh nghiệm', 'đào tạo'] },
  {
    value: '10K',
    suffix: '+',
    lines: ['Sinh viên & Cựu', 'sinh viên thành đạt'],
  },
  {
    value: '100',
    suffix: '%',
    lines: ['Tỷ lệ sinh viên có việc làm sau tốt nghiệp'],
  },
  {
    value: '80',
    suffix: '%',
    lines: ['Giảng viên tốt nghiệp từ các ĐH quốc tế'],
  },
];

function StatisticsSection() {
  return (
    <section className="relative overflow-hidden py-12 lg:pb-[88px] lg:pt-[61px]">
      {/* Decorative vector - bottom right (Figma node 188:13224) */}
      <div className="pointer-events-none absolute left-1/2 top-0 hidden h-full w-[1280px] -translate-x-1/2 lg:block">
        <StatsVector className="absolute left-[1040px] top-[268px] h-[248px] w-[284px]" />
      </div>

      <div className="mx-auto w-full max-w-[1280px] px-6 lg:px-0">
        <div className="flex flex-col items-start gap-8 lg:ml-[149px] lg:h-[455px] lg:w-[1216px] lg:flex-row lg:gap-[57px]">
          {/* Left: heading column - Figma node 188:13310 */}
          <div className="flex shrink-0 items-center gap-[17px] lg:h-[100px] lg:w-[350px]">
            <div className="flex flex-col items-center justify-center shrink-0">
              <div className="h-[58px] w-[4px] bg-green-deep" />
              <div className="h-[38px] w-[4px] bg-orange" />
            </div>
            <h2 className="w-[329px] text-[40px] font-bold uppercase leading-[50px] text-green-deep">
              Những con số
              <br />
              ấn tượng
            </h2>
          </div>

          {/* Right: gradient card - Figma node 188:13223 */}
          <div className="flex w-full flex-col items-start justify-center gap-[29px] rounded-[20px] bg-ttu-gradient-stat-card p-[30px] lg:h-[455px] lg:w-[809px] lg:shrink-0">
            {STATS.map((stat) => (
              <div
                key={stat.value}
                className="content-stretch flex gap-[25px] h-[77px] items-center relative shrink-0 w-full"
              >
                {/* Number block - 150px wide, number 64px + suffix 32px */}
                <div className="flex items-start justify-end w-[150px] shrink-0 text-right whitespace-nowrap">
                  <span className="text-[64px] font-bold leading-[normal] text-ttu-white">
                    {stat.value}
                  </span>
                  <span className="leading-[40px] text-[32px] text-orange font-bold">
                    {stat.suffix}
                  </span>
                </div>
                {/* Label - 176px wide, 16px SemiBold white, multi-line */}
                <div className="w-[176px] shrink-0 whitespace-pre-wrap text-[16px] font-semibold leading-[normal] text-ttu-white">
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

function AboutSection({ locale }: { locale: Locale }) {
  return (
    <section className="relative bg-ttu-white pt-12 lg:pt-[62px]">
      <div className="mx-auto w-full max-w-[1280px]">
        <div className="px-6 lg:ml-[149px] lg:w-[981px] lg:px-0">
          <div className="flex w-full flex-col gap-8 lg:h-[363px] lg:gap-[45px]">
            <div className="flex items-center gap-[17px] lg:h-[100px] lg:w-[731px]">
              <div className="flex shrink-0 flex-col items-center justify-center">
                <div className="h-[58px] w-[4px] bg-green-deep" />
                <div className="h-[38px] w-[4px] bg-orange" />
              </div>
              <h2 className="text-[32px] font-bold uppercase leading-[40px] text-green-deep lg:w-[710px] lg:text-[40px] lg:leading-[50px]">
                Tấm vé thông hành trở thành công dân toàn cầu
              </h2>
            </div>

            <div className="flex w-full items-start lg:h-[218px]">
              <div className="flex items-center justify-end p-[10px] lg:w-[701px]">
                <p className="text-[18px] font-normal leading-normal text-green-deep lg:w-[681px]">
                  Trường Đại học Tân Tạo là trường đại học tư thục phi lợi nhuận theo mô hình của Mỹ
                  tọa lạc trên diện tích 503 ha tại thành phố Tân Đức E.City, xã Đức Hòa, tỉnh Tây
                  Ninh do Bà Đặng Thị Hoàng Yến (a.k.a Maya Dangelas) là người sáng lập và nhà tài
                  trợ chính của Đại học Tân Tạo. Tại TTU, việc học tập suốt đời và phát huy năng lực
                  tự thân luôn được đề cao và coi trọng. Sau khi tốt nghiệp, sinh viên sẽ có khả
                  năng tự trang bị và không ngừng được nâng cao kiến thức để phù hợp với sự phát
                  triển trong định hướng nghề nghiệp và yêu cầu chung của xã hội.
                </p>
              </div>
            </div>
          </div>

          <Link
            href={`/${locale}/gioi-thieu`}
            className="mt-[39px] inline-flex h-[43px] w-[247px] items-center justify-center rounded-[8px] bg-ttu-gradient-about-cta px-5 py-[10px] text-[16px] font-medium leading-normal text-white transition-transform active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-deep focus-visible:ring-offset-2"
          >
            Tìm hiểu thêm về chúng tôi
          </Link>
        </div>
      </div>

      <div className="relative mt-[50px] aspect-[1281/597] w-full overflow-hidden lg:left-1/2 lg:h-[597px] lg:w-[1281px] lg:-translate-x-1/2 lg:aspect-auto">
        <Image
          src={HOME_IMAGES.about}
          alt="Khuôn viên Trường Đại học Tân Tạo"
          fill
          className="object-cover"
          sizes="100vw"
          unoptimized
        />
        <Image
          src={HOME_IMAGES.aboutPlay}
          alt=""
          width={117}
          height={117}
          className="pointer-events-none absolute left-1/2 top-1/2 h-[117px] w-[117px] -translate-x-1/2 -translate-y-1/2"
        />
      </div>
    </section>
  );
}

/** Figma node 1275:174036 — five TTU differentiators over the campus background. */
const WHY_TTU_FEATURES = [
  {
    title: 'Tận hưởng không gian Anh ngữ',
    desc: '"Tắm mình trong Tiếng Anh" từ năm nhất. Đạt chuẩn IELTS 5.5+, TOEIC 620+ chỉ sau 1.5 năm học tập.',
    Icon: WhyTtuIcon1,
  },
  {
    title: 'Môi trường học tập chuẩn Mỹ',
    desc: 'Campus 103ha thuộc top rộng nhất phía Nam. Nằm trong hệ sinh thái Thành phố Tri thức E.City.',
    Icon: WhyTtuIcon2,
  },
  {
    title: 'Tiếp cận triết lý Giáo dục Khai phóng',
    desc: 'Đào tạo con người toàn diện, tôn trọng sự khác biệt và xây dựng tinh thần học tập suốt đời.',
    Icon: WhyTtuIcon3,
  },
  {
    title: 'Quy mô lớp học lý tưởng',
    desc: 'Chỉ 25 – 35 sinh viên/lớp, tối ưu tương tác giữa giảng viên và sinh viên.',
    Icon: WhyTtuIcon4,
  },
  {
    title: 'Đặc quyền Khoa Y',
    desc: 'Tiên phong thực tập tại Hoa Kỳ. Sinh viên trúng tuyển Bác sĩ Nội trú tại Việt Nam và Hoa Kỳ.',
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
    <section className="relative min-h-[940px] overflow-hidden py-12 lg:h-[993px] lg:min-h-0 lg:py-0">
      <div className="absolute left-1/2 top-0 h-full w-full max-w-[1280px] -translate-x-1/2">
        <div className="absolute inset-x-4 inset-y-0 overflow-hidden rounded-[20px] lg:bottom-auto lg:left-[-107px] lg:right-auto lg:h-[993px] lg:w-[1239px]">
          <Image
            src={HOME_IMAGES.whyTtuBackground}
            alt=""
            fill
            className="object-cover"
            sizes="(max-width: 1023px) calc(100vw - 32px), 1239px"
          />
        </div>

        <div className="absolute bottom-[13px] right-0 flex w-[760px] flex-col items-end lg:left-[-360px] lg:top-[570px] lg:w-[1640px]">
          <div className="relative h-[240px] w-[503px] max-w-full lg:h-[358px] lg:w-[749px]">
            <Image
              src={HOME_IMAGES.whyTtuPhoto}
              alt="Cổng chính Trường Đại học Tân Tạo"
              fill
              className="object-contain object-bottom"
              sizes="(max-width: 1023px) 503px, 749px"
            />
          </div>
          <div className="flex h-[13px] w-full" aria-hidden="true">
            <div className="h-full flex-1 bg-orange" />
            <div className="h-full flex-1 bg-green-light" />
          </div>
        </div>
      </div>

      <div className="relative mx-auto flex w-full max-w-[1280px] flex-col gap-8 px-8 lg:absolute lg:left-1/2 lg:top-[102px] lg:h-[640px] lg:w-[936px] lg:-translate-x-[491px] lg:justify-center lg:gap-[38px] lg:px-0">
        <div className="flex w-full max-w-[760px] items-start gap-[17px] lg:w-[743px]">
          <div className="flex shrink-0 self-stretch flex-col items-center justify-center">
            <div className="min-h-px w-1 flex-1 bg-green-deep" />
            <div className="min-h-px w-1 flex-1 bg-orange" />
          </div>
          <h2 className="text-[30px] font-bold uppercase leading-[38px] text-green-deep sm:text-[36px] sm:leading-[44px] lg:text-[40px] lg:leading-[50px]">
            Tại sao ĐẠI HỌC TÂN TẠO là
            <br className="hidden sm:block" /> lựa chọn khác biệt?
          </h2>
        </div>

        <div className="flex flex-col gap-3 lg:gap-[6px]">
          <div className="flex flex-col gap-3 lg:flex-row lg:gap-[34px] lg:py-4">
            <FeatureCard title={f0.title} desc={f0.desc} Icon={f0.Icon} />
            <FeatureCard title={f1.title} desc={f1.desc} Icon={f1.Icon} />
          </div>
          <div className="flex flex-col gap-3 lg:flex-row lg:gap-[34px] lg:py-4">
            <FeatureCard title={f2.title} desc={f2.desc} Icon={f2.Icon} />
            <FeatureCard title={f3.title} desc={f3.desc} Icon={f3.Icon} />
          </div>
          <div className="flex lg:w-[434px] lg:py-4">
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
    <div className="flex w-full items-start lg:w-[434px]">
      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[15px] bg-green-deep">
        <Icon className="h-[50px] w-[50px] text-ttu-white" />
      </div>
      <div className="flex w-full flex-col gap-3 px-5 text-green-deep lg:w-[340px]">
        <h3 className="text-[21px] font-bold leading-[27px] lg:text-[24px] lg:leading-[30px]">
          {title}
        </h3>
        <p className="text-[14px] font-normal leading-normal">{desc}</p>
      </div>
    </div>
  );
}
/** Figma node 190:13321 — four TTU training systems. */
const TRAINING_SYSTEMS = [
  {
    src: HOME_IMAGES.trainingChinhQuy,
    alt: 'Hệ chính quy',
    title: 'CHÍNH QUY',
    description:
      'Chương trình đào tạo đại học tập trung dành cho học sinh đã tốt nghiệp THPT. Sinh viên học tập toàn thời gian tại trường để nhận bằng Cử nhân hoặc Bác sĩ.',
  },
  {
    src: HOME_IMAGES.trainingSauDaiHoc,
    alt: 'Hệ sau đại học',
    title: 'HỆ SAU ĐẠI HỌC',
    description:
      'Chương trình đào tạo bậc Thạc sĩ dành cho người đã tốt nghiệp đại học, nhằm cung cấp kiến thức chuyên môn sâu và nâng cao năng lực nghiên cứu.',
  },
  {
    src: HOME_IMAGES.trainingVanBang2,
    alt: 'Hệ văn bằng 2',
    title: 'HỆ VĂN BẰNG 2',
    description:
      'Chương trình đào tạo cấp bằng đại học thứ hai, dành cho những cá nhân đã sở hữu ít nhất một bằng đại học và muốn học thêm một ngành chuyên môn khác.',
  },
  {
    src: HOME_IMAGES.trainingLienThong,
    alt: 'Hệ liên thông',
    title: 'HỆ LIÊN THÔNG',
    description:
      'Chương trình đào tạo tiếp nối dành cho người đã tốt nghiệp trình độ Trung cấp hoặc Cao đẳng, nhằm bổ sung kiến thức để nhận bằng tốt nghiệp trình độ Đại học.',
  },
];

function TrainingSection() {
  return (
    <section className="overflow-hidden bg-ttu-white py-12 md:py-14 xl:py-[70px]">
      <div className="mx-auto w-full max-w-[1280px] px-5 sm:px-8 xl:px-0">
        <div className="flex flex-col gap-10 xl:ml-[149px] xl:w-[1055px] xl:flex-row xl:items-start xl:gap-6">
          <div className="flex w-full shrink-0 items-center gap-[17px] xl:w-[287px]">
            <div className="flex shrink-0 flex-col items-center justify-center">
              <div className="h-[58px] w-1 bg-green-deep" />
              <div className="h-[38px] w-1 bg-orange" />
            </div>
            <h2 className="min-w-0 text-[32px] font-bold uppercase leading-[40px] text-green-deep sm:text-[36px] sm:leading-[44px] xl:w-[329px] xl:text-[40px] xl:leading-[50px]">
              Các hệ
              <br />
              đào tạo
            </h2>
          </div>

          <div className="grid w-full grid-cols-1 gap-x-5 gap-y-9 sm:grid-cols-2 xl:w-[744px] xl:gap-y-[34px]">
            {TRAINING_SYSTEMS.map((card) => (
              <Link
                key={card.alt}
                href="/dao-tao"
                className="group flex min-w-0 w-full flex-col items-start gap-[18px] sm:gap-[22px] xl:w-[362px]"
              >
                <div className="relative aspect-[289/168] w-full overflow-hidden rounded-[15px] xl:w-[289px]">
                  <Image
                    src={card.src}
                    alt={card.alt}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 639px) calc(100vw - 40px), (max-width: 1023px) calc(50vw - 42px), 289px"
                  />
                </div>
                <div className="flex min-w-0 w-full flex-col items-start gap-[10px] text-left xl:w-[264px]">
                  <h3 className="text-[22px] font-bold leading-[28px] text-green-light sm:text-[24px] sm:leading-[30px]">
                    {card.title}
                  </h3>
                  <p className="text-[14px] font-normal leading-normal text-green-text">
                    {card.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/** Figma node 190:13394 — seven faculty cards on the regular-program surface. */
const PROGRAMS = [
  {
    faculty: 'Khoa Y',
    majors: ['Y đa khoa'],
    href: 'https://tuyensinh.ttu.edu.vn/y-khoa',
    Icon: FacultyIcon1,
  },
  {
    faculty: 'Khoa Công nghệ thông tin',
    majors: ['Khoa học máy tính', 'Khoa học dữ liệu', 'Trí tuệ nhân tạo', 'Công nghệ thông tin'],
    Icon: FacultyIcon2,
  },
  {
    faculty: 'Khoa Công nghệ sinh học',
    majors: ['Công nghệ sinh học', 'Nông nghiệp công nghệ cao'],
    Icon: FacultyIcon3,
  },
  {
    faculty: 'Khoa Ngôn ngữ',
    majors: ['Ngôn ngữ Anh', 'Ngôn ngữ Trung Quốc', 'Ngôn ngữ Hàn Quốc'],
    Icon: FacultyIcon4,
  },
  {
    faculty: 'Khoa Kinh tế và Quản trị Kinh doanh',
    majors: [
      'Kinh doanh quốc tế',
      'Quản trị kinh doanh',
      'Kế toán',
      'Tài chính – Ngân hàng',
      'Digital Marketing',
      'Logistic và Quản lý chuỗi cung ứng',
      'Truyền thông đa phương tiện',
      'Luật Kinh tế',
      'Luật',
    ],
    Icon: FacultyIcon5,
  },
  {
    faculty: 'Khoa Nhân văn và Giáo dục Khai phóng',
    majors: [],
    href: 'https://ttu.edu.vn/khoa-nhan-van-va-giao-duc-khai-phong/',
    Icon: FacultyIcon6,
  },
  {
    faculty: 'Khoa Điều dưỡng & Kỹ thuật Xét nghiệm Y học',
    majors: ['Điều dưỡng', 'Kỹ thuật xét nghiệm'],
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
    <section className="relative min-h-[1469px] overflow-hidden bg-[#ececec]">
      <div className="mx-auto w-full max-w-[1280px] px-6 py-12 lg:px-[147px] lg:py-[70px]">
        <div className="flex w-full flex-col items-start gap-5">
          <div className="flex w-full items-center gap-[17px]">
            <div className="flex self-stretch shrink-0 flex-col items-center justify-center">
              <div className="min-h-px w-1 flex-1 bg-green-deep" />
              <div className="h-[38px] w-1 shrink-0 bg-orange" />
            </div>
            <h2 className="w-[547px] text-[34px] font-bold uppercase leading-[43px] text-green-deep lg:text-[40px] lg:leading-[50px]">
              Chương trình đào tạo hệ chính quy
            </h2>
          </div>
          <p className="max-w-[965px] text-[18px] font-normal leading-normal text-green-deep lg:h-[128px] lg:text-[20px]">
            &quot;Trường Đại học Tân Tạo hiện có 7 Khoa đào tạo với 21 ngành và chuyên ngành khác
            nhau. Chương trình học tại TTU được thiết kế theo tiêu chuẩn giáo dục Hoa Kỳ, kết hợp mô
            hình Khai phóng giúp sinh viên phát triển toàn diện cả về kiến thức chuyên môn lẫn tư
            duy sáng tạo.&quot;
          </p>
          <Link
            href="/dao-tao"
            className="flex w-full max-w-[348px] items-center gap-[10px] rounded-[8px] border border-green-deep px-5 text-[16px] font-medium leading-normal text-green-deep transition-colors hover:bg-green-deep hover:text-ttu-white"
          >
            <span className="flex-1 py-[10px]">Xem toàn bộ chương trình đào tạo</span>
            <Image
              src={HOME_IMAGES.programsArrow}
              alt=""
              width={17}
              height={19}
              className="h-[19px] w-[17px] shrink-0"
            />
          </Link>
        </div>

        <div className="relative z-10 mt-[60px] flex w-full flex-col items-start gap-[30px]">
          <div className="grid w-full gap-[30px] sm:grid-cols-2 lg:flex lg:justify-center lg:gap-[93px]">
            {[p0, p1, p2].map((program) => (
              <FacultyCard key={program.faculty} {...program} />
            ))}
          </div>
          <div className="grid w-full gap-[30px] sm:grid-cols-2 lg:flex lg:justify-center lg:gap-[93px]">
            {[p3, p4, p5].map((program) => (
              <FacultyCard key={program.faculty} {...program} />
            ))}
          </div>
          <FacultyCard {...p6} />
        </div>
      </div>

      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 hidden h-[428px] lg:block"
        aria-hidden="true"
      >
        <ScholarshipsVector className="absolute bottom-[13px] right-0 h-[415px] w-[476px]" />
        <div className="absolute inset-x-0 bottom-0 flex h-[13px]">
          <div className="flex-1 bg-orange" />
          <div className="flex-1 bg-green-light" />
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
  const content = (
    <>
      <div className="flex h-16 w-16 items-center justify-center rounded-[15px] bg-green-deep">
        <Icon className="h-[50px] w-[50px] text-ttu-white" />
      </div>
      <div className="flex w-full flex-col items-start gap-[5px]">
        <h3 className="text-[20px] font-bold leading-[25px] text-green-deep">{faculty}</h3>
        {majors.length > 0 && (
          <p className="text-[14px] font-normal leading-normal text-green-deep">
            {majors.map((major, index) => (
              <span key={major}>
                {major}
                {index < majors.length - 1 ? <br /> : null}
              </span>
            ))}
          </p>
        )}
      </div>
    </>
  );

  const className = 'flex w-[265px] flex-col items-start gap-[19px]';
  if (href) {
    return (
      <Link href={href} className={`${className} hover:opacity-80`} target="_blank">
        {content}
      </Link>
    );
  }
  return <div className={className}>{content}</div>;
}
/** Figma nodes 341:13622 and 457:49664 — six undergraduate admission methods. */
const ADMISSIONS_METHODS = [
  {
    code: '301',
    title: 'Xét tuyển thẳng theo quy định của Quy chế tuyển sinh',
    desc: 'Áp dụng xét tuyển thẳng theo quy định (Điều 8) của Bộ Giáo dục và Đào tạo.',
  },
  {
    code: '100',
    title: 'Xét kết quả thi tốt nghiệp THPT',
    desc: 'Tổng điểm 03 môn thi theo tổ hợp xét tuyển đạt tối thiểu 15,00 điểm (trên thang điểm 30). Riêng chương trình đào tạo lĩnh vực Sức khỏe và lĩnh vực Pháp luật sẽ căn cứ theo ngưỡng đảm bảo chất lượng quy định bởi Bộ GD&ĐT.',
  },
  {
    code: '200',
    title: 'Xét tuyển sử dụng kết quả học tập ở cấp THPT (Học bạ)',
    desc: 'Xét điểm trung bình chung cả năm lớp 10, 11, 12 của tối thiểu 03 môn học; hoặc 02 môn kết hợp quy đổi điểm chứng chỉ ngoại ngữ. Đối với nhóm ngành Sức khỏe và Pháp luật, thí sinh cần đạt điều kiện bổ sung về học lực lớp 12 (loại Khá hoặc Giỏi tùy ngành) và điểm xét tốt nghiệp THPT.',
  },
  {
    code: '402',
    title: 'Xét kết quả thi Đánh giá năng lực (ĐHQG TP.HCM) năm 2026',
    desc: 'Sử dụng kết quả kỳ thi đánh giá năng lực do Đại học Quốc gia TP.HCM tổ chức. Cần đáp ứng ngưỡng đảm bảo chất lượng đầu vào đối với các chương trình đào tạo thuộc lĩnh vực Sức khỏe và Pháp luật.',
  },
  {
    code: '407',
    title: 'Kết hợp kết quả thi tốt nghiệp THPT với kết quả học tập cấp THPT để xét tuyển',
    desc: 'Phương thức kết hợp giữa điểm thi tốt nghiệp và điểm học bạ. Thí sinh cần đáp ứng ngưỡng đảm bảo chất lượng đầu vào riêng của Nhà trường',
  },
  {
    code: '1411',
    title: 'Xét tuyển thí sinh tốt nghiệp THPT nước ngoài',
    desc: 'Phương thức dành riêng để xét tuyển các thí sinh đã tốt nghiệp chương trình THPT ở nước ngoài.',
  },
];

function AdmissionsSection() {
  return (
    <section className="relative min-h-[1118px] overflow-hidden py-12 lg:h-[1118px] lg:min-h-0 lg:py-0">
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

      <div className="relative mx-auto h-full w-full max-w-[1280px] px-6 lg:px-0">
        <Image
          src={HOME_IMAGES.admissionsRingOuter}
          alt=""
          width={752}
          height={822}
          className="pointer-events-none absolute left-[899px] top-[140px] hidden h-[822px] w-[752px] lg:block"
        />
        <Image
          src={HOME_IMAGES.admissionsRingInner}
          alt=""
          width={496}
          height={542}
          className="pointer-events-none absolute left-[1027px] top-[280px] hidden h-[542px] w-[496px] lg:block"
        />
        <div className="pointer-events-none absolute left-[676px] top-[421px] hidden h-[697px] w-[575px] overflow-hidden lg:block">
          <Image
            src={HOME_IMAGES.admissionsDecoration}
            alt="Sinh viên tốt nghiệp Trường Đại học Tân Tạo"
            fill
            className="object-cover"
            sizes="575px"
          />
        </div>

        <div className="relative z-10 flex max-w-[827px] items-center gap-[17px] lg:absolute lg:left-[148px] lg:top-[88px] lg:h-[127px]">
          <div className="flex shrink-0 flex-col items-center justify-center">
            <div className="h-[58px] w-1 bg-ttu-white" />
            <div className="h-[38px] w-1 bg-orange" />
          </div>
          <h2 className="text-[32px] font-bold uppercase leading-[40px] text-ttu-white lg:w-[827px] lg:text-[40px] lg:leading-[50px]">
            <span>06 </span>
            <span className="text-orange">Phương thức xét tuyển </span>
            <br />
            để trở thành sinh viên ttu
          </h2>
        </div>

        <div className="relative z-10 mt-10 flex w-full max-w-[617px] flex-col gap-[15px] lg:absolute lg:left-[136px] lg:top-[236px] lg:mt-0 lg:h-[860px]">
          {ADMISSIONS_METHODS.map((method) => (
            <MethodRow key={method.code} {...method} />
          ))}
        </div>
      </div>
    </section>
  );
}

function MethodRow({ code, title, desc }: { code: string; title: string; desc: string }) {
  return (
    <div className="flex w-full items-stretch gap-5">
      <div className="flex w-[76px] shrink-0 items-center justify-center rounded-[5px] bg-ttu-gradient-cta p-[10px] sm:w-[96px]">
        <span className="whitespace-nowrap text-center text-[24px] font-bold leading-[30px] text-ttu-white">
          {code}
        </span>
      </div>
      <div className="flex flex-1 flex-col items-start justify-center gap-[3px] rounded-[5px] bg-ttu-white p-5 lg:w-[501px] lg:flex-none">
        <p className="text-[16px] font-bold leading-normal text-green-deep">{title}</p>
        <p className="text-[12px] font-light leading-normal text-green-deep">{desc}</p>
      </div>
    </div>
  );
}

/** Figma node 1005:175084 — 2026 admission scholarships. */
const SCHOLARSHIPS = [
  {
    eyebrow: 'Hơn',
    headline: '38 TỶ',
    tail: 'từ Quỹ học bổng ITA',
    desc: 'Trao 100 suất học bổng toàn phần cho học sinh có thành tích học tập tốt, khó khăn về tài chính.',
    Icon: ScholarshipIcon1,
  },
  {
    eyebrow: 'Ưu đãi học phí',
    headline: '30-100%',
    tail: 'năm đầu tiên',
    desc: 'Áp dụng tất cả phương thức xét tuyển với ưu đãi từ 30%, 50%, 75% và 100% học phí (dựa trên điểm số đầu vào).',
    Icon: ScholarshipIcon2,
  },
  {
    eyebrow: 'Hỗ trợ vay học phí',
    headline: '0%',
    tail: 'lãi suất',
    desc: 'Sinh viên từ năm thứ hai có cơ hội vay học phí 0% lãi suất, tối đa 50% học phí mỗi học kỳ.',
    Icon: ScholarshipIcon3,
  },
  {
    eyebrow: 'Cam kết',
    headline: 'HỌC PHÍ',
    tail: 'học phí toàn khóa không tăng',
    desc: 'Trao 100 suất học bổng toàn phần cho học sinh có thành tích học tập tốt, khó khăn về tài chính.',
    Icon: ScholarshipIcon4,
  },
];

function ScholarshipsSection() {
  return (
    <section className="relative min-h-[597px] overflow-hidden py-[65px]">
      <div className="absolute inset-0">
        <Image src={HOME_IMAGES.scholarship} alt="" fill className="object-cover" sizes="100vw" />
        <div className="absolute inset-0 bg-ttu-gradient-hero-overlay" />
      </div>

      <div className="relative mx-auto flex w-full max-w-[1280px] items-center justify-center px-6 lg:px-[84px]">
        <div className="flex w-full flex-col items-center gap-[53px] lg:w-[1112px]">
          <div className="flex w-full flex-col items-center text-center text-ttu-white">
            <h2 className="w-full text-[34px] font-bold uppercase leading-[43px] lg:w-[586px] lg:text-[40px] lg:leading-[50px]">
              Học bổng tuyển sinh 2026
            </h2>
            <p className="mt-[9px] text-[24px] font-bold leading-[30px]">Chắp cánh tài năng trẻ</p>
          </div>

          <div className="grid w-full gap-[37px] sm:grid-cols-2 lg:flex lg:items-center">
            {SCHOLARSHIPS.map((scholarship) => (
              <article
                key={scholarship.headline}
                className="flex w-full flex-col items-start gap-[10px] rounded-[15px] bg-ttu-white p-5 lg:w-[216px] lg:shrink-0"
              >
                <div className="flex w-full flex-col items-start text-green-deep">
                  <p className="mb-[-3px] text-[14px] font-normal leading-normal">
                    {scholarship.eyebrow}
                  </p>
                  <p className="mb-[-3px] text-[24px] font-bold leading-[30px]">
                    {scholarship.headline}
                  </p>
                  <p className="text-[14px] font-normal leading-normal">{scholarship.tail}</p>
                </div>
                <div className="flex h-16 w-16 items-center justify-center rounded-[15px] bg-green-deep">
                  <scholarship.Icon className="h-[50px] w-[50px] text-ttu-white" />
                </div>
                <p className="min-h-[82px] text-[12px] font-light leading-normal text-green-deep">
                  {scholarship.desc}
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
// Figma node 204:16456 (Frame 131) — heading + five-company horizontal logo strip.
const PARTNERS = [
  { name: 'Công ty Cổ phần Y tế VH Care', logo: HOME_IMAGES.partnerVhCare },
  { name: 'Công ty TNHH Simpson Strong-Tie Việt Nam', logo: HOME_IMAGES.partnerSimpson },
  { name: 'Công ty Cổ phần IIG Việt Nam', logo: HOME_IMAGES.partnerIig },
  { name: 'Arham Ấn Độ', logo: HOME_IMAGES.partnerArham, fit: true },
  { name: 'Bệnh viện Đa khoa Khu vực Hóc Môn', logo: HOME_IMAGES.partnerHocMon },
];

function PartnersSection() {
  return (
    <section className="relative overflow-hidden bg-ttu-white py-12 sm:py-16 xl:py-20">
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex h-[13px]">
        <div className="flex-1 bg-orange" />
        <div className="flex-1 bg-green-light" />
      </div>

      <div className="mx-auto w-full max-w-[1280px] px-5 sm:px-8 xl:px-0">
        <div className="flex w-full items-center gap-[17px] xl:ml-[149px] xl:w-[526px]">
          <div className="flex shrink-0 flex-col items-center justify-center">
            <div className="h-[58px] w-1 bg-green-deep" />
            <div className="h-[38px] w-1 bg-orange" />
          </div>
          <h2 className="min-w-0 text-[32px] font-bold uppercase leading-[40px] text-green-deep sm:text-[36px] sm:leading-[44px] xl:w-[526px] xl:text-[40px] xl:leading-[50px]">
            Kết nối mạng lưới
            <br />
            toàn cầu
          </h2>
        </div>

        <div className="partner-marquee mt-10 overflow-hidden sm:mt-[59px] xl:ml-[149px] xl:w-[1056px]">
          <div className="partner-marquee-track flex w-max items-start">
            {[0, 1].map((copy) => (
              <div
                key={copy}
                aria-hidden={copy === 1}
                className="flex shrink-0 items-start gap-5 pr-5"
              >
                {PARTNERS.map((partner) => (
                  <article
                    key={copy + '-' + partner.name}
                    className="flex w-[220px] shrink-0 flex-col items-start gap-[9px] sm:w-[264px]"
                  >
                    <div className="relative h-[120px] w-[120px] shrink-0 overflow-hidden">
                      <Image
                        src={partner.logo}
                        alt={copy === 0 ? partner.name : ''}
                        fill
                        className={partner.fit ? 'object-contain' : 'object-cover'}
                        sizes="120px"
                      />
                    </div>
                    <p className="w-[182px] text-[16px] font-normal uppercase leading-normal text-green-light sm:min-h-[57px] sm:text-[18px]">
                      {partner.name}
                    </p>
                  </article>
                ))}
              </div>
            ))}
          </div>
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
    desc: 'Mục đích: Hỗ trợ vay cho sinh viên TTU có hoàn cảnh gia đình khó khăn.',
    featured: true,
  },
  {
    img: HOME_IMAGES.announcementThumb,
    title: 'NGÀNH HỌC "TRIỆU ĐÔ" CHO 2k8 MÊ GREEN-TECH: NÔNG NGHIỆP',
    desc: 'Mục đích: Hỗ trợ vay cho sinh viên TTU có hoàn cảnh gia đình khó khăn.',
  },
  {
    img: HOME_IMAGES.announcementThumb,
    title: 'NGÀNH HỌC "TRIỆU ĐÔ" CHO 2k8 MÊ GREEN-TECH: NÔNG NGHIỆP',
    desc: 'Mục đích: Hỗ trợ vay cho sinh viên TTU có hoàn cảnh gia đình khó khăn.',
  },
  {
    img: HOME_IMAGES.announcementThumb,
    title: 'NGÀNH HỌC "TRIỆU ĐÔ" CHO 2k8 MÊ GREEN-TECH: NÔNG NGHIỆP',
    desc: 'Mục đích: Hỗ trợ vay cho sinh viên TTU có hoàn cảnh gia đình khó khăn.',
  },
  {
    img: HOME_IMAGES.announcementThumb,
    title: 'NGÀNH HỌC "TRIỆU ĐÔ" CHO 2k8 MÊ GREEN-TECH: NÔNG NGHIỆP',
    desc: 'Mục đích: Hỗ trợ vay cho sinh viên TTU có hoàn cảnh gia đình khó khăn.',
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
        paddingTop: 'clamp(48px, 8vh, 74px)',
        paddingBottom: 'clamp(48px, 8vh, 74px)',
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

function FeaturedAnnouncement({ announcement }: { announcement: (typeof ANNOUNCEMENTS)[number] }) {
  return (
    <Link
      href="/thong-bao"
      className="group flex items-center gap-[43px] hover:opacity-90 transition-opacity"
    >
      <div
        className="relative shrink-0 rounded-[15px] overflow-hidden"
        style={{ width: '240px', aspectRatio: '1' }}
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

function SmallAnnouncement({ announcement }: { announcement: (typeof ANNOUNCEMENTS)[number] }) {
  return (
    <Link
      href="/thong-bao"
      className="group flex items-start gap-[25px] hover:opacity-90 transition-opacity"
    >
      <div
        className="relative shrink-0 rounded-[10px] overflow-hidden"
        style={{ width: '150px', height: '150px' }}
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
        <p className="font-light leading-snug text-body-xs text-ttu-white">{announcement.desc}</p>
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
    category: 'Hợp tác quốc tế',
    title: 'TTU ký kết hợp tác với Đại học Rice (Hoa Kỳ)',
    date: '2026-09-06',
    excerpt:
      'Chương trình liên kết đào tạo quốc tế chính thức được công bố với nhiều học bổng cho sinh viên TTU.',
  },
  {
    img: HOME_IMAGES.news2,
    category: 'Cơ sở vật chất',
    title: 'Khánh thành Trung tâm Mô phỏng Y khoa thế hệ mới',
    date: '2026-09-04',
    excerpt:
      'Trung tâm đầu tiên tại Việt Nam đạt chuẩn quốc tế phục vụ đào tạo Bác sĩ và Điều dưỡng.',
  },
  {
    img: HOME_IMAGES.news3,
    category: 'Thành tích sinh viên',
    title: 'Sinh viên TTU đạt giải Nhất cuộc thi AI quốc gia 2026',
    date: '2026-08-30',
    excerpt: 'Đội tuyển Khoa Công nghệ vượt qua hơn 200 đội từ 30 trường đại học trên cả nước.',
  },
];

function NewsSection() {
  return (
    <section
      className="relative bg-ttu-white"
      style={{
        paddingTop: 'clamp(48px, 8vh, 70px)',
        paddingBottom: 'clamp(48px, 8vh, 70px)',
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
              <div className="relative" style={{ aspectRatio: '362/310' }}>
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
                  {new Date(n.date).toLocaleDateString('vi-VN')}
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

/** Figma node 204:16769 — admissions counseling registration section. */
function RegistrationSection() {
  return (
    <section className="relative min-h-[731px] overflow-hidden">
      <Image
        src={HOME_IMAGES.registrationBackground}
        alt="Cổng chính Trường Đại học Tân Tạo"
        fill
        className="object-cover"
        sizes="100vw"
      />

      <div className="relative mx-auto min-h-[731px] w-full max-w-[1280px] px-6 py-12 lg:px-0 lg:py-0">
        <div className="flex flex-col items-start gap-10 lg:absolute lg:left-[148px] lg:top-[75px] lg:flex-row lg:gap-[83px]">
          <RegistrationForm />

          <div className="flex w-full max-w-[431px] flex-col items-start gap-3 lg:h-[179px]">
            <div className="flex w-full items-center gap-[27px]">
              <div className="flex w-2 shrink-0 flex-col items-center justify-center">
                <div className="h-[39px] w-2 bg-orange" />
                <div className="h-[58px] w-2 bg-green" />
              </div>
              <h2 className="w-[410px] text-[34px] font-bold uppercase leading-[43px] text-green-deep lg:text-[40px] lg:leading-[50px]">
                Đăng ký tư vấn
                <br />
                <span className="text-green">nhận tuyển sinh</span>
              </h2>
            </div>
            <p className="max-w-[374px] text-[14px] font-normal leading-normal text-green-deep">
              Chương trình được thực hiện từ Quỹ ITA Vì Tương Lai dành cho sinh viên có hoàn cảnh
              khó khăn, nhằm giúp các bạn tiếp tục theo học.
            </p>
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
      <AboutSection locale={locale} />
      <StatisticsSection />
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
