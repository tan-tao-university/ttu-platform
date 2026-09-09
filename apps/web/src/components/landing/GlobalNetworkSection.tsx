import Image from 'next/image';

const PARTNER_LOGOS = [
  {
    src: 'https://www.figma.com/api/mcp/asset/f23e2def-35c5-4c94-a8e4-1cec5a9cbad3.png',
    name: 'VH Care',
  },
  {
    src: 'https://www.figma.com/api/mcp/asset/a557974e-fc4f-4e54-a530-40553b5ff532.png',
    name: 'Simpson Strong-Tie',
  },
  {
    src: 'https://www.figma.com/api/mcp/asset/428dd7e4-f46d-4967-9ccb-4b80b2138adf.png',
    name: 'IIG Vietnam',
  },
  {
    src: 'https://www.figma.com/api/mcp/asset/39486c56-7686-41f0-9efb-17bb71b38de5.png',
    name: 'Arharm',
  },
  {
    src: 'https://www.figma.com/api/mcp/asset/a95cbb86-ee30-4d0e-92b4-61ada1ad6a07.png',
    name: 'BV khu vực Hoc Mon',
  },
  {
    src: 'https://www.figma.com/api/mcp/asset/56c25eea-0cb3-49a7-a3e6-1a74315222cc.png',
    name: 'BV 1A',
  },
  {
    src: 'https://www.figma.com/api/mcp/asset/6557e905-7e39-442b-a582-d69a81ceaf40.png',
    name: 'ITA',
  },
  {
    src: 'https://www.figma.com/api/mcp/asset/250c0a7c-7339-470d-b3aa-0f403d806c71.png',
    name: 'BV Tay Ninh',
  },
  {
    src: 'https://www.figma.com/api/mcp/asset/1f950fef-3345-4797-9a80-2b9821744efe.png',
    name: 'Chenla University',
  },
  {
    src: 'https://www.figma.com/api/mcp/asset/d648fabb-f43e-4e05-ba37-8ef38c6fb8cf.png',
    name: 'Yonam University',
  },
  {
    src: 'https://www.figma.com/api/mcp/asset/58600501-e1c3-46c8-a74b-5c67b0bb2a6d.png',
    name: 'BV Long An',
  },
  {
    src: 'https://www.figma.com/api/mcp/asset/584c8e75-1480-4229-8d12-c13f9682e41c.png',
    name: 'CD Y duoc Hong Duc',
  },
  {
    src: 'https://www.figma.com/api/mcp/asset/d417e10b-d33f-4187-afc5-d8bc9e6faf17.png',
    name: 'So KHCN Tay Ninh',
  },
];

export default function GlobalNetworkSection() {
  return (
    <section className="w-full max-w-screen-xl mx-auto px-[148px] py-[100px]">
      <div className="flex flex-col gap-[60px]">
        {/* Heading */}
        <div className="flex items-center gap-[17px] w-[526px]">
          <div className="flex flex-col">
            <div className="w-[4px] h-[58px] bg-brand-deep" />
            <div className="w-[4px] h-[38px] bg-accent-orange" />
          </div>
          <h2 className="font-bold text-[40px] leading-[50px] uppercase text-brand-deep">
            Kết nối mạng lưới
            <br />
            toàn cầu
          </h2>
        </div>

        {/* Partner logos marquee — 13 partners scrolling horizontally */}
        <div className="relative w-full overflow-hidden">
          {/* Edge fades */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-[80px] z-10 bg-gradient-to-r from-white to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-[80px] z-10 bg-gradient-to-l from-white to-transparent" />

          {/* Track — duplicated list for seamless loop */}
          <div className="flex w-max animate-[scroll_40s_linear_infinite] hover:[animation-play-state:paused]">
            {[...PARTNER_LOGOS, ...PARTNER_LOGOS].map((partner, i) => (
              <div
                key={`${partner.name}-${i}`}
                className="flex flex-col items-start gap-[12px] w-[264px] px-[10px] shrink-0"
              >
                <div className="relative w-[160px] h-[120px]">
                  <Image
                    src={partner.src}
                    alt={partner.name}
                    fill
                    className="object-contain"
                    unoptimized
                  />
                </div>
                <p className="text-[16px] uppercase text-brand-light leading-[1.4] h-[44px]">
                  {partner.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
