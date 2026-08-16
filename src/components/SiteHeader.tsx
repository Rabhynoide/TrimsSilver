import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="border-b border-neutral-800 bg-neutral-950">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <Link
          href="/"
          className="text-lg font-semibold tracking-tight text-neutral-100"
        >
          Albion<span className="text-amber-500">Market</span>
        </Link>
        <nav className="flex items-center gap-6 text-sm text-neutral-400">
          <Link href="/" className="transition-colors hover:text-neutral-100">
            Accueil
          </Link>
          <Link
            href="/prices"
            className="transition-colors hover:text-neutral-100"
          >
            Vérification des prix
          </Link>
        </nav>
      </div>
    </header>
  );
}
