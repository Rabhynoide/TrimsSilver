import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-24 text-center">
      <h1 className="text-2xl font-semibold text-neutral-100">
        Objet introuvable
      </h1>
      <p className="mt-3 text-neutral-400">
        Cet objet n&apos;existe pas ou n&apos;a pas été trouvé dans notre
        base de données.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-neutral-950 hover:bg-amber-400"
      >
        Retour à l&apos;accueil
      </Link>
    </div>
  );
}
