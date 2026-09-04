# Content audit — current ttu.edu.vn (WordPress)

Snapshot taken while scaffolding this repo (2026-09), to inform the ERD design this repo is
deliberately not doing yet (see root [README.md](../README.md) Status). Re-check the live site
before designing the schema — it changes independently of this repo.

## Top-level navigation

- **Giới thiệu** (About) — sub-pages: Bộ máy tổ chức, Chiến lược phát triển, Đảm bảo chất lượng
  giáo dục, Lịch sử, Lời ngỏ, Thông tin thăm quan.
- **Tuyển sinh** (Admissions) — already split into separate WordPress multisite-style
  subdomains per program: chính quy (`tuyensinh.ttu.edu.vn`), văn bằng 2 tiếng Anh, liên thông Y
  đa khoa, and three master's programs (Khoa học máy tính, QTKD/MBA, Ngôn ngữ Anh).
- **Đào tạo** (Academics) — training calendar, curricula.
- **Nghiên cứu** (Research) — separate subdomain (`research.ttu.edu.vn`).
- **Các khoa** (Faculties) — links out to each faculty's own site, plus the K-12 school
  (`ttst.edu.vn`) and the teaching hospital (`benhvientantao.com`). The 7 faculties already have
  a home in the sibling `ttu-web-platform` repo; this repo only needs to link to them, not host
  their content.
- **Tin tức & Sự kiện** (News & Events) — five WordPress categories: Bản tin tháng, Báo chí viết
  về TTU, Nhật ký thực tập, Sự kiện, Tin tức. These read as one underlying "post" content type
  with a category taxonomy, not five separate schemas.
- **Vinh danh** (Honors/recognition), **Đóng góp** (Giving/donations), **Lịch công tác** (Weekly
  work schedule) — each a single page or a short list, not obviously a full content type.

## Homepage sections observed

- Hero/slider (marketing banner, links to the current admissions cycle).
- "TIN TỨC" — latest posts from Tin tức & Sự kiện.
- "THÔNG BÁO CHUNG" (general notices) — a distinct, more official-sounding feed from "Tin tức"
  (admissions results, tuition deadlines, graduation ceremonies, staff recruitment). Likely a
  second post type or a tag/category rather than the same feed re-sorted.
- Static banner links to each admissions program's own subdomain.
- "NGHIÊN CỨU" (Research) — another post feed, separate from Tin tức.
- "NHÂN VIÊN" (Staff) — mostly static links (careers, working-at-TTU pages) plus a link out to
  a separate internal staff portal (`internal.ttu.edu.vn`).
- "SỰ KIỆN" (Events) — calendar-style, currently empty on the live site.
- "KẾT NỐI" (quick links) — Thư viện (Library), Lịch đào tạo, Hỗ trợ tài chính — all external or
  cross-linked pages, not content this site would own.
- Footer — Google Maps embed, contact phone/email/address.

## Implication for the future schema (not designed here)

At minimum this suggests more than one post-like content type (news/events vs. official
notices vs. research updates), a category taxonomy per type, and a clear line between content
this repo owns (pages, posts, notices) versus content it only links to (faculty sites, the
research subdomain, admissions program subdomains, the staff portal). None of this is
implemented — `apps/api/src/db` does not exist yet. Design the ERD against this audit plus
whatever the content/comms team actually wants to keep, not against a literal 1:1 copy of the
WordPress category list.
