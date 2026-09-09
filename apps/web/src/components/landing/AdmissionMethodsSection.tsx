import Image from 'next/image';

const METHOD_BG = 'https://www.figma.com/api/mcp/asset/eb11ec52-bb0f-4b86-a60e-f7990d09583b.png';
const METHOD_DIAGRAM =
  'https://www.figma.com/api/mcp/asset/29a50015-b423-446f-a9f5-3f9be9af24c4.png';

const METHODS = [
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
    desc: 'Xét điểm trung bình chung cả năm lớp 10, 11, 12 của tối thiểu 03 môn học; hoặc 02 môn kết hợp quy đổi điểm chứng chỉ ngoại ngữ.',
  },
  {
    code: '402',
    title: 'Xét kết quả thi Đánh giá năng lực (ĐHQG TP.HCM) năm 2026',
    desc: 'Sử dụng kết quả kỳ thi đánh giá năng lực do Đại học Quốc gia TP.HCM tổ chức.',
  },
  {
    code: '407',
    title: 'Kết hợp kết quả thi tốt nghiệp THPT với kết quả học tập cấp THPT để xét tuyển',
    desc: 'Phương thức kết hợp giữa điểm thi tốt nghiệp và điểm học bạ. Thí sinh cần đáp ứng ngưỡng đảm bảo chất lượng đầu vào riêng của Nhà trường.',
  },
  {
    code: '1411',
    title: 'Xét tuyển thí sinh tốt nghiệp THPT nước ngoài',
    desc: 'Phương thức dành riêng để xét tuyển các thí sinh đã tốt nghiệp chương trình THPT ở nước ngoài.',
  },
];

export default function AdmissionMethodsSection() {
  return (
    <section className="relative w-full py-[120px] overflow-hidden">
      {/* Background image + dark overlay */}
      <div className="absolute inset-0 overflow-hidden">
        <Image
          src={METHOD_BG}
          alt=""
          fill
          className="object-cover"
          unoptimized
          style={{ objectPosition: 'top' }}
        />
        <div className="absolute inset-0 bg-[rgba(0,34,21,0.7)]" />
      </div>

      <div className="relative z-10 max-w-screen-xl mx-auto px-[148px]">
        {/* Heading */}
        <div className="flex items-center gap-[17px] mb-[60px]">
          <div className="flex flex-col">
            <div className="w-[4px] h-[58px] bg-white" />
            <div className="w-[4px] h-[38px] bg-[#ff794a]" />
          </div>
          <h2 className="font-bold text-[40px] leading-[50px] uppercase text-white">
            06 <span className="text-accent-orange">PHƯƠNG THỨC XÉT TUYỂN</span>
            <br />
            ĐỂ TRỞ THÀNH SINH VIÊN TTU
          </h2>
        </div>

        {/* Content: methods list + radial diagram */}
        <div className="flex items-start gap-[136px]">
          {/* Method rows */}
          <div className="flex flex-col gap-[15px] w-[617px]">
            {METHODS.map((m) => (
              <MethodRow key={m.code} {...m} />
            ))}
          </div>

          {/* Radial diagram placeholder */}
          <div className="relative w-[575px] h-[697px]">
            <Image src={METHOD_DIAGRAM} alt="" fill className="object-contain" unoptimized />
          </div>
        </div>
      </div>
    </section>
  );
}

function MethodRow({ code, title, desc }: { code: string; title: string; desc: string }) {
  return (
    <div className="flex items-center gap-[20px]">
      {/* Code badge */}
      <div
        className="flex items-center justify-center w-[96px] h-[96px] shrink-0 rounded-[5px]
                   bg-gradient-to-b from-accent-orange to-[#ff9500] p-[10px]"
      >
        <span className="font-bold text-[24px] leading-[30px] text-center text-white">{code}</span>
      </div>

      {/* Text card */}
      <div className="flex flex-col gap-[3px] p-[20px] bg-white rounded-[5px] w-[501px]">
        <p className="font-bold text-[16px] text-brand-deep">{title}</p>
        <p className="text-[12px] leading-normal text-brand-deep font-light">{desc}</p>
      </div>
    </div>
  );
}
