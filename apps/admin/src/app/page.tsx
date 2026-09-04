export default function AdminHomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center gap-4 px-6">
      <h1 className="text-3xl font-semibold">Quản trị nội dung TTU</h1>
      <p className="text-neutral-600">
        Bảng quản trị đang được khởi tạo. Đăng nhập, phân quyền và các màn hình quản lý nội dung sẽ
        được thêm sau khi mô hình dữ liệu (ERD) và luồng xác thực với ttu-identity được chốt.
      </p>
    </main>
  );
}
