import Image from 'next/image';

const WHY_BG = 'https://www.figma.com/api/mcp/asset/c1ab47ed-7851-40bf-a8c1-56b6166d5c4e.png';
const WHY_IMAGE = 'https://www.figma.com/api/mcp/asset/38ba90e3-28c6-41b4-8755-98cfa3ffe1a5.png';

const WHY_FEATURES = [
  {
    icon: 'https://www.figma.com/api/mcp/asset/9fbab9b5-7daf-4091-ad91-69f366ade77c.svg',
    title: 'Tận hưởng không gian Anh ngữ',
    desc: '"Tắm mình trong Tiếng Anh" từ năm nhất. Đạt chuẩn IELTS 5.5+, TOEIC 620+ chỉ sau 1.5 năm học tập.',
  },
  {
    icon: 'https://www.figma.com/api/mcp/asset/891f5b1a-675f-40d8-8491-779581e5cf1e.svg',
    title: 'Môi trường học tập chuẩn Mỹ',
    desc: 'Campus 103ha thuộc top rộng nhất phía Nam. Nằm trong hệ sinh thái Thành phố Tri thức E.City.',
  },
  {
    icon: 'https://www.figma.com/api/mcp/asset/a12487ec-6d3e-4d9f-8e4a-22c4cdd40f5b.svg',
    title: 'Tiếp cận triết lý Giáo dục Khai phóng',
    desc: 'Đào tạo con người toàn diện, tôn trọng sự khác biệt và xây dựng tinh thần học tập suốt đời.',
  },
  {
    icon: 'https://www.figma.com/api/mcp/asset/9e9173a5-dc4a-4cc4-a0d1-c96363387f68.svg',
    title: 'Quy mô lớp học lý tưởng',
    desc: 'Chỉ 25 – 35 sinh viên/lớp, tối ưu tương tác giữa giảng viên và sinh viên.',
  },
  {
    icon: 'https://www.figma.com/api/mcp/asset/1f9c63f9-f614-4e6b-b3b4-d9cc262d2600.svg',
    title: 'Đặc quyền Khoa Y',
    desc: 'Tiên phong thực tập tại Hoa Kỳ. Sinh viên trúng tuyển Bác sĩ Nội trú tại Việt Nam và Hoa Kỳ.',
  },
];

export default function WhyTtuSection() {
  return (
    <section className="relative w-full py-[2529px]">
      {/* Background image */}
      <Image src={WHY_BG} alt="" fill className="object-cover rounded-[20px]" unoptimized />

      <div className="relative z-10 max-w-screen-xl mx-auto px-[149px]">
        {/* Decorative image bottom-right */}
        <div className="absolute left-0 bottom-0 w-[1640px]">
          <div className="relative w-[749px] h-[358px]">
            <Image src={WHY_IMAGE} alt="" fill className="object-cover" unoptimized />
          </div>
          {/* Color band */}
          <div className="flex h-[13px]">
            <div className="w-[820px] bg-[#ff794a]" />
            <div className="w-[820px] bg-[#3db97d]" />
          </div>
        </div>

        {/* Section content */}
        <div className="flex flex-col gap-[38px]">
          {/* Heading */}
          <div className="flex items-start gap-[17px]">
            <div className="flex flex-col">
              <div className="w-[4px] flex-1 bg-[#1f664c] min-h-[50px]" />
              <div className="w-[4px] flex-1 bg-[#ff794a] min-h-[50px]" />
            </div>
            <h2 className="font-bold text-[40px] leading-[50px] uppercase text-[#1f664c]">
              Tại sao ĐẠI HỌC TÂN TẠO là
              <br />
              lựa chọn khác biệt?
            </h2>
          </div>

          {/* Feature cards — 2 columns */}
          <div className="flex flex-col gap-[34px]">
            {/* Row 1: 2 cards */}
            <div className="flex gap-[34px]">
              {(WHY_FEATURES.slice(0, 2) as typeof WHY_FEATURES).map((f, i) => (
                <FeatureCard key={i} {...f} />
              ))}
            </div>
            {/* Row 2: 2 cards */}
            <div className="flex gap-[34px]">
              {(WHY_FEATURES.slice(2, 4) as typeof WHY_FEATURES).map((f, i) => (
                <FeatureCard key={i + 2} {...f} />
              ))}
            </div>
            {/* Row 3: 1 card */}
            <div className="flex gap-[34px]">
              <FeatureCard {...WHY_FEATURES[4]!} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FeatureCard({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-[20px] px-[20px] py-[16px] rounded-[10px] w-[404px]">
      <div className="relative w-[64px] h-[64px] shrink-0">
        <div className="absolute inset-0 bg-[#1f664c] rounded-[15px]" />
        <Image src={icon} alt="" fill className="object-contain p-[15%]" unoptimized />
      </div>
      <div className="flex flex-col gap-[12px]">
        <h3 className="font-bold text-[24px] leading-[30px] text-[#1f664c]">{title}</h3>
        <p className="text-[14px] leading-normal text-[#1f664c]">{desc}</p>
      </div>
    </div>
  );
}
