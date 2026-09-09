import Image from 'next/image';

const FORM_BG = 'https://www.figma.com/api/mcp/asset/bf1314e5-d5a9-4a8b-b6a9-7cae7b2347ef.png';
const CHEVRON_DOWN = 'https://www.figma.com/api/mcp/asset/5c2a4f16-aab2-40c5-91ce-e0fa147e5430.svg';
const SEND_ICON = 'https://www.figma.com/api/mcp/asset/c3241284-8167-4a0b-ab2a-cb6e9ffa58bd.svg';

function FormField({
  label,
  required,
  placeholder,
}: {
  label: string;
  required?: boolean;
  placeholder: string;
}) {
  return (
    <div className="flex flex-col gap-[10px]">
      <p className="text-[18px] text-[#1f664c]">
        {label}
        {required && <span className="text-[#ff794a] ml-1">*</span>}
      </p>
      <div className="flex items-center gap-[10px] px-[20px] py-[10px] bg-[#f2f2f2] rounded-[8px]">
        <span className="text-[16px] font-medium text-[#d2d2d2]">{placeholder}</span>
      </div>
    </div>
  );
}

function SelectField({ label, placeholder }: { label: string; placeholder: string }) {
  return (
    <div className="flex flex-col gap-[10px]">
      <p className="text-[18px] text-[#1f664c]">{label}</p>
      <div className="flex items-center justify-between px-[20px] py-[10px] bg-[#f2f2f2] rounded-[8px]">
        <span className="text-[16px] font-medium text-[#d2d2d2]">{placeholder}</span>
        <Image src={CHEVRON_DOWN} alt="" width={20} height={10} unoptimized />
      </div>
    </div>
  );
}

export default function AdmissionFormSection() {
  return (
    <section className="relative w-full py-[9590px]">
      {/* Background image */}
      <div className="absolute inset-0">
        <Image src={FORM_BG} alt="" fill className="object-cover" unoptimized />
      </div>

      <div className="relative z-10 px-[148px] max-w-screen-xl mx-auto">
        <div className="flex gap-[83px]">
          {/* Form card */}
          <div
            className="flex flex-col gap-[32px] p-[33px] bg-white rounded-[10px] w-[535px] shrink-0"
            style={{
              boxShadow: '0 0 4px rgba(12,12,13,0.05), 0 0 16px rgba(12,12,13,0.10)',
            }}
          >
            <p className="text-[14px] leading-normal text-[#1f664c]">
              Điền thông tin của bạn vào đây để đội ngũ tuyển sinh hỗ trợ tư vấn bạn nhanh nhất nhé!
            </p>

            {/* Row 1: Name + Phone */}
            <div className="flex gap-[20px]">
              <FormField label="Tên của bạn" required placeholder="Nhập tên của bạn" />
              <FormField label="Số điện thoại" required placeholder="Nhập số điện thoại" />
            </div>

            {/* Row 2: Email + Province */}
            <div className="flex gap-[20px]">
              <FormField label="Email" required placeholder="Nhập email của bạn" />
              <SelectField label="Tỉnh thành" placeholder="Chọn tỉnh thành" />
            </div>

            {/* Row 3: Program + Major */}
            <div className="flex gap-[20px]">
              <SelectField label="Hệ đào tạo quan tâm" placeholder="Hệ đào tạo" />
              <SelectField label="Ngành quan tâm" placeholder="Ngành" />
            </div>

            {/* Submit button */}
            <button
              className="inline-flex items-center gap-[10px] px-[20px] py-[10px] rounded-[8px]
                         bg-gradient-to-b from-[#ff794a] to-[#ff9500]
                         text-[18px] text-white w-[229px]"
            >
              <span className="flex-1 text-left font-normal">Gửi thông tin</span>
              <Image src={SEND_ICON} alt="" width={16} height={18} unoptimized />
            </button>
          </div>

          {/* Side text */}
          <div className="flex flex-col gap-[12px] w-[431px]">
            <div className="flex items-center gap-[27px]">
              <div className="flex flex-col">
                <div className="w-[8px] h-[39px] bg-[#ff794a]" />
                <div className="w-[8px] h-[58px] bg-[#229a68]" />
              </div>
              <h2 className="font-bold text-[40px] leading-[50px] uppercase">
                <span className="text-[#1f664c]">Đăng ký tư vấn</span>
                <br />
                <span className="text-[#229a68]">nhận tuyển sinh</span>
              </h2>
            </div>
            <p className="text-[14px] leading-normal text-[#1f664c] flex-1">
              Chương trình được thực hiện từ Quỹ ITA Vì Tương Lai dành cho sinh viên có hoàn cảnh
              khó khăn, nhằm giúp các bạn tiếp tục theo học.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
