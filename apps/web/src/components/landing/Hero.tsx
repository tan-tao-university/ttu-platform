import Link from 'next/link';
import Image from 'next/image';

const HERO_BG = 'https://www.figma.com/api/mcp/asset/e4419a47-c76f-4a31-bdeb-bc0915736a98.png';
const CTA_ICON = 'https://www.figma.com/api/mcp/asset/649e15b7-1803-45ca-9c7c-6a5ff8b6c358.svg';

export default function Hero() {
  return (
    <section className="relative w-full overflow-hidden" style={{ height: 597 }}>
      {/* Background image */}
      <Image src={HERO_BG} alt="" fill className="object-cover" priority unoptimized />
      {/* Dark gradient overlay — Figma gradient: -43.4deg, rgba(45,46,131,0.8) 22.87%, rgba(0,141,54,0.72) 78.72% */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(-43.4deg, rgba(45,46,131,0.8) 22.87%, rgba(0,141,54,0.72) 78.72%)',
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col justify-end px-[140px] pb-[61px] h-full max-w-screen-xl mx-auto">
        {/* Text block */}
        <div className="mb-[258px]">
          {/* Accent bar + headline */}
          <div className="flex items-center gap-[17px] mb-[5px]">
            <div className="flex flex-col items-center">
              <div className="w-[4px] h-[58px] bg-white" />
              <div className="w-[4px] h-[38px] bg-[#ff794a]" />
            </div>
            <h1 className="font-bold text-[40px] leading-[50px] uppercase text-white">
              From Knowledge to
              <br />
              the Stars
            </h1>
          </div>
          <p className="text-[18px] leading-normal text-white/90 ml-[21px] mt-[5px]">
            Tiên phong Giáo dục Khai phóng: Nơi tài năng Việt vươn tầm quốc tế
          </p>
        </div>

        {/* CTA button */}
        <Link
          href="https://tuyensinh.ttu.edu.vn"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-[10px] px-[20px] py-[10px] rounded-[8px] w-[262px]
                     bg-gradient-to-b from-[#ff794a] to-[#ff9500]
                     text-[16px] font-medium text-white
                     hover:opacity-90 transition-opacity"
        >
          <span className="flex-1">Đăng ký xét tuyển ngay</span>
          <Image src={CTA_ICON} alt="" width={16} height={18} unoptimized className="shrink-0" />
        </Link>
      </div>
    </section>
  );
}
