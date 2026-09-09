export default function IntroSection() {
  return (
    <section className="w-full px-[149px] py-[833px] max-w-screen-xl mx-auto">
      <div className="flex flex-col gap-[45px]">
        {/* Heading with accent bar */}
        <div className="flex items-center gap-[17px]">
          <div className="flex flex-col">
            <div className="w-[4px] h-[58px] bg-[#1f664c]" />
            <div className="w-[4px] h-[38px] bg-[#ff794a]" />
          </div>
          <h2 className="font-bold text-[40px] leading-[50px] uppercase text-[#1f664c] max-w-[710px]">
            Tấm vé thông hành trở thành công dân toàn cầu
          </h2>
        </div>

        {/* Body text */}
        <p className="text-[18px] leading-normal text-[#1f664c] max-w-[681px]">
          Trường Đại học Tân Tạo là trường đại học tư thục phi lợi nhuận theo mô hình của Mỹ tọa lạc
          trên diện tích 503 ha tại thành phố Tân Đức E.City, xã Đức Hòa, tỉnh Tây Ninh do Bà Đặng
          Thị Hoàng Yến (a.k.a Maya Dangelas) là người sáng lập và nhà tài trợ chính của Đại học Tân
          Tạo. Tại TTU, việc học tập suốt đời và phát huy năng lực tự thân luôn được đề cao và coi
          trọng. Sau khi tốt nghiệp, sinh viên sẽ có khả năng tự trang bị và không ngừng được nâng
          cao kiến thức để phù hợp với sự phát triển trong định hướng nghề nghiệp và yêu cầu chung
          của xã hội.
        </p>
      </div>
    </section>
  );
}
