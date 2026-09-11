'use client';

import Image from 'next/image';
import { useState } from 'react';
import { HOME_IMAGES } from '@/lib/figma-images';

/** Admissions counseling form matching Figma node 204:16773. */
export function RegistrationForm() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="flex min-h-[528px] w-full max-w-[535px] flex-col items-center justify-center rounded-[10px] bg-ttu-white p-[33px] text-center shadow-ttu-500">
        <h3 className="text-[24px] font-bold leading-[30px] text-green-deep">Cảm ơn bạn!</h3>
        <p className="mt-3 text-[14px] leading-normal text-green-deep">
          Đội ngũ tư vấn tuyển sinh sẽ liên hệ trong 24 giờ.
        </p>
      </div>
    );
  }

  const fieldClassName =
    'h-[43px] w-full rounded-[8px] border-0 bg-ttu-gray-light px-5 text-[16px] font-medium leading-normal text-green-deep placeholder:text-ttu-gray-dark focus:ring-2 focus:ring-green-light';
  const selectClassName = `${fieldClassName} appearance-none bg-[length:20px_10px] bg-[right_20px_center] bg-no-repeat pr-12 text-ttu-gray-dark`;

  return (
    <form
      className="flex w-full max-w-[535px] flex-col items-start gap-8 rounded-[10px] bg-ttu-white p-[33px] shadow-ttu-500"
      onSubmit={handleSubmit}
    >
      <p className="h-[43px] max-w-[374px] overflow-hidden text-[14px] font-normal leading-normal text-green-deep">
        Điền thông tin của bạn vào đây để đội ngũ tuyển sinh hỗ trợ tư vấn bạn nhanh nhất nhé!
      </p>

      <div className="flex w-full flex-col items-center justify-center gap-[35px]">
        <div className="grid w-full gap-5 sm:grid-cols-2">
          <FormField label="Tên của bạn" required>
            <input className={fieldClassName} name="name" placeholder="Nhập tên của bạn" required />
          </FormField>
          <FormField label="Số điện thoại" required>
            <input
              className={fieldClassName}
              name="phone"
              placeholder="Nhập số điện thoại"
              required
              type="tel"
            />
          </FormField>
        </div>

        <div className="grid w-full gap-5 sm:grid-cols-2">
          <FormField label="Email" required>
            <input
              className={fieldClassName}
              name="email"
              placeholder="Nhập email của bạn"
              required
              type="email"
            />
          </FormField>
          <FormField label="Tỉnh thành">
            <select
              className={selectClassName}
              defaultValue=""
              name="province"
              style={{ backgroundImage: `url(${HOME_IMAGES.registrationChevron})` }}
            >
              <option disabled value="">
                Chọn tỉnh thành
              </option>
              <option value="long-an">Long An</option>
              <option value="tp-hcm">TP. Hồ Chí Minh</option>
              <option value="other">Tỉnh thành khác</option>
            </select>
          </FormField>
        </div>

        <div className="grid w-full gap-5 sm:grid-cols-2">
          <FormField label="Hệ đào tạo quan tâm">
            <select
              className={selectClassName}
              defaultValue=""
              name="trainingSystem"
              style={{ backgroundImage: `url(${HOME_IMAGES.registrationChevron})` }}
            >
              <option disabled value="">
                Hệ đào tạo
              </option>
              <option value="undergraduate">Chính quy</option>
              <option value="postgraduate">Sau đại học</option>
              <option value="second-degree">Văn bằng 2</option>
              <option value="bridging">Liên thông</option>
            </select>
          </FormField>
          <FormField label="Ngành quan tâm">
            <select
              className={selectClassName}
              defaultValue=""
              name="major"
              style={{ backgroundImage: `url(${HOME_IMAGES.registrationChevron})` }}
            >
              <option disabled value="">
                Ngành
              </option>
              <option value="medicine">Y đa khoa</option>
              <option value="information-technology">Công nghệ thông tin</option>
              <option value="business">Kinh tế và Quản trị kinh doanh</option>
              <option value="other">Ngành khác</option>
            </select>
          </FormField>
        </div>
      </div>

      <button
        type="submit"
        className="flex h-[43px] w-[229px] items-center gap-[10px] rounded-[8px] bg-ttu-gradient-cta px-5 text-[18px] font-normal leading-normal text-ttu-white transition-transform active:scale-95"
      >
        <span className="flex-1 text-left">Gửi thông tin</span>
        <Image
          src={HOME_IMAGES.registrationArrow}
          alt=""
          width={17}
          height={19}
          className="h-[19px] w-[17px] shrink-0"
        />
      </button>
    </form>
  );
}

function FormField({
  label,
  required = false,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="flex w-full flex-col items-start gap-[10px] text-[18px] font-normal leading-normal text-green-deep sm:w-[229px]">
      <span>
        {label}
        {required ? <span className="text-orange">*</span> : null}
      </span>
      {children}
    </label>
  );
}
