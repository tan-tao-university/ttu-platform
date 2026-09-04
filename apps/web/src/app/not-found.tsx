import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center gap-3 px-6 text-center">
      <h1 className="text-2xl font-semibold">Không tìm thấy trang</h1>
      <p className="text-neutral-600">Trang bạn tìm không tồn tại hoặc đã được di chuyển.</p>
      <Link href="/" className="font-medium text-orange-700 hover:underline">
        Về trang chủ
      </Link>
    </main>
  );
}
