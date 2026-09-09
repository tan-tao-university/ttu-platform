import Image from 'next/image';

const PROGRAM_IMAGES = [
  'https://www.figma.com/api/mcp/asset/65cc598a-3684-4910-a6cf-fb1154d0953d.png',
  'https://www.figma.com/api/mcp/asset/e72d1e6b-b8de-4380-8a5e-460473af5314.png',
  'https://www.figma.com/api/mcp/asset/1a581f7b-33dd-4db6-bba4-0fbc073e6fff.png',
  'https://www.figma.com/api/mcp/asset/fd68414a-1146-419f-8f66-31cbe3b2777b.png',
];

const PROGRAMS = [
  {
    label: 'CHÍNH QUY',
    desc: 'Chương trình đào tạo đại học tập trung dành cho học sinh đã tốt nghiệp THPT. Sinh viên học tập toàn thời gian tại trường để nhận bằng Cử nhân hoặc Bác sĩ.',
  },
  {
    label: 'HỆ SAU ĐẠI HỌC',
    desc: 'Chương trình đào tạo bậc Thạc sĩ dành cho người đã tốt nghiệp đại học, nhằm cung cấp kiến thức chuyên môn sâu và nâng cao năng lực nghiên cứu.',
  },
  {
    label: 'HỆ VĂN BẰNG 2',
    desc: 'Chương trình đào tạo cấp bằng đại học thứ hai, dành cho những cá nhân đã sở hữu ít nhất một bằng đại học và muốn học thêm một ngành chuyên môn khác.',
  },
  {
    label: 'HỆ LIÊN THÔNG',
    desc: 'Chương trình đào tạo tiếp nối dành cho người đã tốt nghiệp trình độ Trung cấp hoặc Cao đẳng, nhằm bổ sung kiến thức để nhận bằng tốt nghiệp trình độ Đại học.',
  },
];

export default function ProgramsSection() {
  return (
    <section className="w-full px-[149px] py-[4353px] max-w-screen-xl mx-auto">
      <div className="flex gap-[24px]">
        {/* Side label */}
        <div className="flex items-center gap-[17px] w-[287px] shrink-0">
          <div className="flex flex-col">
            <div className="w-[4px] h-[58px] bg-[#1f664c]" />
            <div className="w-[4px] h-[38px] bg-[#ff794a]" />
          </div>
          <div className="font-bold text-[40px] leading-[50px] uppercase text-[#1f664c]">
            Các hệ
            <br />
            đào tạo
          </div>
        </div>

        {/* Program cards — 2x2 grid */}
        <div className="flex flex-col gap-[34px] w-[744px]">
          {/* Row 1 */}
          <div className="flex gap-[20px]">
            {PROGRAMS.slice(0, 2).map((p, i) => (
              <ProgramCard key={i} program={p} image={PROGRAM_IMAGES[i]!} />
            ))}
          </div>
          {/* Row 2 */}
          <div className="flex gap-[20px]">
            {PROGRAMS.slice(2, 4).map((p, i) => (
              <ProgramCard key={i + 2} program={p} image={PROGRAM_IMAGES[i + 2]!} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ProgramCard({ program, image }: { program: (typeof PROGRAMS)[0]; image: string }) {
  return (
    <div className="flex flex-col gap-[22px] w-[362px]">
      <div className="relative h-[168px] w-[289px] rounded-[15px] overflow-hidden">
        <Image src={image} alt={program.label} fill className="object-cover" unoptimized />
      </div>
      <div className="flex flex-col gap-[10px]">
        <h3 className="font-bold text-[24px] leading-[30px] text-[#3db97d]">{program.label}</h3>
        <p className="text-[14px] leading-normal text-[#103925]">{program.desc}</p>
      </div>
    </div>
  );
}
