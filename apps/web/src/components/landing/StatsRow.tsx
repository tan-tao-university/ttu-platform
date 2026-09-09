function StatItem({ value, unit, label }: { value: string; unit: string; label: string }) {
  return (
    <div className="flex items-center gap-[25px] h-[77px]">
      <div className="flex items-start text-right w-[150px] shrink-0">
        <span className="text-[64px] font-bold text-white leading-normal">{value}</span>
        <span className="text-[32px] leading-[40px] text-accent-orange">{unit}</span>
      </div>
      <span className="font-semibold text-[16px] text-white w-[176px] leading-normal">{label}</span>
    </div>
  );
}

export default function StatsRow() {
  const stats = [
    { value: '15', unit: '+', label: 'Năm kinh nghiệm\nđào tạo' },
    { value: '10K', unit: '+', label: 'Sinh viên & Cựu\nsinh viên thành đạt' },
    { value: '100', unit: '%', label: 'Tỷ lệ sinh viên có việc làm sau tốt nghiệp' },
    { value: '80', unit: '%', label: 'Giảng viên tốt nghiệp từ các ĐH quốc tế' },
  ];

  return (
    <section className="w-full max-w-screen-xl mx-auto px-[148px] py-[120px]">
      <div className="flex items-center gap-[57px]">
        {/* Side label */}
        <div className="flex items-center gap-[17px] w-[350px] shrink-0">
          <div className="flex flex-col">
            <div className="w-[4px] h-[58px] bg-brand-deep" />
            <div className="w-[4px] h-[38px] bg-accent-orange" />
          </div>
          <div className="font-bold text-[40px] leading-[50px] uppercase text-brand-deep">
            Những con số
            <br />
            ấn tượng
          </div>
        </div>

        {/* Stats card */}
        <div
          className="flex flex-col gap-[29px] p-[30px] rounded-[20px] shrink-0 w-[809px]"
          style={{
            background: 'linear-gradient(to bottom, #008d36, #2d2e83)',
          }}
        >
          {stats.map((s, i) => (
            <StatItem key={i} value={s.value} unit={s.unit} label={s.label} />
          ))}
        </div>
      </div>
    </section>
  );
}
