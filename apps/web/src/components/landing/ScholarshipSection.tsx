import Image from 'next/image';

const SCHOLARSHIP_BG =
  'https://www.figma.com/api/mcp/asset/62ae630c-2d43-4d6b-b499-a2d5940ec8c0.png';

const SCHOLARSHIP_ICONS = [
  'https://www.figma.com/api/mcp/asset/fc322ea2-b670-4611-8294-67307d6f4689.svg',
  'https://www.figma.com/api/mcp/asset/0f0c8220-6e24-4d44-9184-3489270c816c.svg',
  'https://www.figma.com/api/mcp/asset/ca77ecf2-bfcb-4c02-bda7-949d2bad9dbc.svg',
  'https://www.figma.com/api/mcp/asset/fd6e083b-7f39-45a6-9ba6-fe9b0d51a007.svg',
];

const SCHOLARSHIP_CARDS = [
  {
    label: 'Hơn',
    value: '38 TỶ',
    sub: 'từ Quỹ học bổng ITA',
    desc: 'Trao 100 suất học bổng toàn phần cho học sinh có thành tích học tập tốt, khó khăn về tài chính.',
  },
  {
    label: 'Ưu đãi học phí',
    value: '30-100%',
    sub: 'năm đầu tiên',
    desc: 'Áp dụng tất cả phương thức xét tuyển với ưu đãi từ 30%, 50%, 75% và 100% học phí (dựa trên điểm số đầu vào).',
  },
  {
    label: 'Hỗ trợ vay học phí',
    value: '0%',
    sub: 'lãi suất',
    desc: 'Sinh viên từ năm thứ hai có cơ hội vay học phí 0% lãi suất, tối đa 50% học phí mỗi học kỳ.',
  },
  {
    label: 'Cam kết',
    value: 'HỌC PHÍ',
    sub: 'học phí toàn khóa\nkhông tăng',
    desc: 'Trao 100 suất học bổng toàn phần cho học sinh có thành tích học tập tốt, khó khăn về tài chính.',
  },
];

export default function ScholarshipSection() {
  return (
    <section className="relative w-full py-[5772px]">
      {/* Background image + overlay */}
      <div className="absolute inset-0 overflow-hidden">
        <Image src={SCHOLARSHIP_BG} alt="" fill className="object-cover" unoptimized />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(-43.4deg, rgba(45,46,131,0.8) 22.87%, rgba(0,141,54,0.72) 78.72%)',
          }}
        />
      </div>

      <div className="relative z-10 px-[84px] py-[65px] max-w-screen-xl mx-auto">
        <div className="flex flex-col items-center gap-[53px]">
          {/* Heading */}
          <div className="flex flex-col items-center text-center gap-[9px]">
            <h2 className="font-bold text-[40px] leading-[50px] uppercase text-white">
              HỌC BỔNG TUYỂN SINH 2026
            </h2>
            <p className="font-bold text-[24px] leading-[30px] text-white">
              Chắp cánh tài năng trẻ
            </p>
          </div>

          {/* Cards row */}
          <div className="flex gap-[37px]">
            {SCHOLARSHIP_CARDS.map((card, i) => (
              <ScholarshipCard key={i} card={card} icon={SCHOLARSHIP_ICONS[i]!} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ScholarshipCard({ card, icon }: { card: (typeof SCHOLARSHIP_CARDS)[0]; icon: string }) {
  return (
    <div className="flex flex-col gap-[10px] p-[20px] bg-white rounded-[15px] w-[216px]">
      {/* Amount */}
      <div className="flex flex-col text-[#1f664c]">
        <span className="text-[14px]">{card.label}</span>
        <span className="font-bold text-[24px] leading-[30px]">{card.value}</span>
        <span className="text-[14px] whitespace-pre-line">{card.sub}</span>
      </div>

      {/* Icon */}
      <div className="relative w-[64px] h-[64px]">
        <div className="absolute inset-0 bg-[#1f664c] rounded-[15px]" />
        <Image src={icon} alt="" fill className="object-contain p-[15%]" unoptimized />
      </div>

      {/* Description */}
      <p className="text-[12px] leading-normal text-[#1f664c] h-[82px]">{card.desc}</p>
    </div>
  );
}
