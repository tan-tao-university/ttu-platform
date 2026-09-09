"use client";
/**
 * RegistrationForm — client component for the admission registration form.
 * Split from HomePage to allow event handlers in a client boundary.
 */
import { useState } from "react";

export function RegistrationForm() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="rounded-xl bg-white/10 p-8 text-center">
        <div className="text-4xl mb-4">🎉</div>
        <h3
          className="text-white font-bold text-xl mb-2"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Cảm ơn bạn!
        </h3>
        <p
          className="text-white/70"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          Đội ngũ tư vấn tuyển sinh sẽ liên hệ trong 24 giờ.
        </p>
      </div>
    );
  }

  return (
    <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Họ và tên"
        required
        className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/50 text-base focus:outline-none focus:ring-2 focus:ring-white/40"
        style={{ fontFamily: "var(--font-sans)" }}
      />
      <input
        type="email"
        placeholder="Email"
        required
        className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/50 text-base focus:outline-none focus:ring-2 focus:ring-white/40"
        style={{ fontFamily: "var(--font-sans)" }}
      />
      <input
        type="tel"
        placeholder="Số điện thoại"
        required
        className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/50 text-base focus:outline-none focus:ring-2 focus:ring-white/40"
        style={{ fontFamily: "var(--font-sans)" }}
      />
      <input
        type="text"
        placeholder="Ngành quan tâm"
        className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/50 text-base focus:outline-none focus:ring-2 focus:ring-white/40"
        style={{ fontFamily: "var(--font-sans)" }}
      />
      <button
        type="submit"
        className="w-full py-3 rounded-lg font-semibold text-button text-ttu-white transition-transform active:scale-95 focus:outline-none focus-visible:ring-2 focus:ring-ttu-white/40 bg-ttu-gradient-cta"
      >
        Gửi đăng ký
      </button>
    </form>
  );
}
