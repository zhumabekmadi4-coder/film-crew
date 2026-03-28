import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
      <span className="text-6xl mb-4">🎬</span>
      <h1 className="text-2xl font-bold mb-2">Страница не найдена</h1>
      <p className="text-muted-foreground mb-6">Такой страницы не существует или она была удалена</p>
      <Link
        href="/feed"
        className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
      >
        На главную
      </Link>
    </div>
  );
}
