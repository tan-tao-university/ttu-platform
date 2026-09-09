import Image from 'next/image';

const ANNOUNCEMENT_IMG =
  'https://www.figma.com/api/mcp/asset/bad02965-f850-4a6d-baa0-e652fc8f87b8.png';

const ANNOUNCEMENTS = [
  {
    title: 'NGÀNH HỌC "TRIỆU ĐÔ" CHO 2k8 MÊ GREEN-TECH: NÔNG NGHIỆP',
    desc: 'Mục đích: Hỗ trợ vay cho sinh viên TTU có hoàn cảnh gia đình khó khăn.',
  },
  {
    title: 'NGÀNH HỌC "TRIỆU ĐÔ" CHO 2k8 MÊ GREEN-TECH: NÔNG NGHIỆP',
    desc: 'Mục đích: Hỗ trợ vay cho sinh viên TTU có hoàn cảnh gia đình khó khăn.',
  },
  {
    title: 'NGÀNH HỌC "TRIỆU ĐÔ" CHO 2k8 MÊ GREEN-TECH: NÔNG NGHIỆP',
    desc: 'Mục đích: Hỗ trợ vay cho sinh viên TTU có hoàn cảnh gia đình khó khăn.',
  },
  {
    title: 'NGÀNH HỌC "TRIỆU ĐÔ" CHO 2k8 MÊ GREEN-TECH: NÔNG NGHIỆP',
    desc: 'Mục đích: Hỗ trợ vay cho sinh viên TTU có hoàn cảnh gia đình khó khăn.',
  },
];

export default function AnnouncementsSection() {
  return (
    <section className="relative w-full py-[8030px]">
      {/* Gradient background */}
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(to bottom, #008d36, #2d2e83)' }}
      />

      <div className="relative z-10 px-[148px] py-[74px] max-w-screen-xl mx-auto">
        <div className="flex flex-col gap-[59px]">
          {/* Heading */}
          <div className="flex items-start gap-[17px]">
            <div className="flex flex-col">
              <div className="w-[4px] flex-1 bg-white min-h-[50px]" />
              <div className="w-[4px] h-[38px] bg-[#ff794a]" />
            </div>
            <h2 className="font-bold text-[40px] leading-[50px] uppercase text-white">
              THÔNG BÁO CHUNG MỚI NHẤT
            </h2>
          </div>

          {/* Featured announcement */}
          <div className="flex gap-[43px]">
            <div className="relative w-[240px] h-[240px] rounded-[15px] overflow-hidden shrink-0">
              <Image src={ANNOUNCEMENT_IMG} alt="" fill className="object-cover" unoptimized />
            </div>
            <div className="flex flex-col gap-[28px]">
              <h3 className="font-bold text-[32px] leading-[40px] text-[#3db97d]">
                NGÀNH HỌC &quot;TRIỆU ĐÔ&quot; CHO 2k8 MÊ GREEN-TECH: NÔNG NGHIỆP
              </h3>
              <p className="flex-1 text-[14px] leading-normal text-white">
                Mục đích: Hỗ trợ vay cho sinh viên TTU có hoàn cảnh gia đình khó khăn.
              </p>
              <p className="text-[12px] font-light text-[#ff794a]">Xem chi tiết &gt;&gt;</p>
            </div>
          </div>

          {/* Announcement cards grid */}
          <div className="flex flex-col gap-[27px]">
            <div className="flex gap-[82px]">
              {ANNOUNCEMENTS.slice(0, 2).map((a, i) => (
                <AnnouncementCard key={i} {...a} />
              ))}
            </div>
            <div className="flex gap-[82px]">
              {ANNOUNCEMENTS.slice(2, 4).map((a, i) => (
                <AnnouncementCard key={i + 2} {...a} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function AnnouncementCard({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="flex gap-[25px]">
      <div className="relative w-[150px] h-[150px] rounded-[10px] overflow-hidden shrink-0">
        <Image src={ANNOUNCEMENT_IMG} alt="" fill className="object-cover" unoptimized />
      </div>
      <div className="flex flex-col gap-[7px]">
        <p className="font-semibold text-[16px] text-[#3db97d]">{title}</p>
        <p className="flex-1 text-[12px] text-white">{desc}</p>
        <p className="text-[8px] text-[#ff794a]">Xem chi tiết &gt;&gt;</p>
      </div>
    </div>
  );
}
