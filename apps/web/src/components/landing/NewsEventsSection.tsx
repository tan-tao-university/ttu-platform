import Image from 'next/image';

const NEWS_IMAGE = 'https://www.figma.com/api/mcp/asset/34a65fa4-f88f-4c72-b1e1-f45514580b53.png';

const NEWS_ITEMS = [
  {
    label: 'Trụ sở chính',
    desc: 'Mục đích: Hỗ trợ vay cho sinh viên TTU có hoàn cảnh gia đình khó khăn.',
  },
  {
    label: 'Trụ sở chính',
    desc: 'Mục đích: Hỗ trợ vay cho sinh viên TTU có hoàn cảnh gia đình khó khăn.',
  },
  {
    label: 'Trụ sở chính',
    desc: 'Mục đích: Hỗ trợ vay cho sinh viên TTU có hoàn cảnh gia đình khó khăn.',
  },
];

export default function NewsEventsSection() {
  return (
    <section className="w-full px-[148px] py-[9047px] max-w-screen-xl mx-auto">
      <div className="flex flex-col gap-[53px]">
        {/* Heading */}
        <div className="flex items-start gap-[17px]">
          <div className="flex flex-col">
            <div className="w-[4px] flex-1 bg-[#1f664c] min-h-[50px]" />
            <div className="w-[4px] h-[24px] bg-[#ff794a]" />
          </div>
          <h2 className="font-bold text-[40px] leading-[50px] uppercase text-[#1f664c]">
            TIN TỨC VÀ SỰ KIỆN MỚI NHẤT
          </h2>
        </div>

        {/* News cards + CTA */}
        <div className="flex flex-col gap-[54px]">
          {/* 3 news cards */}
          <div className="flex gap-[348px]">
            {NEWS_ITEMS.map((item, i) => (
              <NewsCard key={i} {...item} />
            ))}
          </div>

          {/* CTA button */}
          <button
            className="inline-flex items-center justify-center px-[20px] py-[10px] rounded-[8px] w-[175px]
                       bg-gradient-to-b from-[#008d36] to-[#2d2e83]
                       text-[16px] font-medium text-white self-center"
          >
            Xem tất cả tin tức
          </button>
        </div>
      </div>
    </section>
  );
}

function NewsCard({ label, desc }: { label: string; desc: string }) {
  return (
    <div className="flex flex-col gap-[22px] w-[362px]">
      <div className="relative h-[168px] w-[289px] rounded-[15px] overflow-hidden">
        <Image src={NEWS_IMAGE} alt={label} fill className="object-cover" unoptimized />
      </div>
      <div className="flex flex-col gap-[10px]">
        <h3 className="font-bold text-[24px] leading-[30px] text-[#3db97d]">{label}</h3>
        <p className="text-[14px] leading-normal text-[#103925]">{desc}</p>
      </div>
      <p className="text-[12px] font-light text-[#ff794a]">Xem chi tiết &gt;&gt;</p>
    </div>
  );
}
