import Link from "next/link";
import { FavoritesList } from "@/components/FavoritesList";
import { ItemSearchInput } from "@/components/ItemSearchInput";

export default function HomePage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center px-4 py-24 text-center">
      <h1 className="text-3xl font-semibold tracking-tight text-neutral-100 sm:text-4xl">
        Le marché d&apos;Albion Online, en un coup d&apos;œil
      </h1>
      <p className="mt-4 max-w-xl text-neutral-400">
        Recherchez un objet pour voir ses prix en temps réel dans chaque
        ville, et suivre l&apos;évolution du marché au fil du temps.
      </p>

      <div className="mt-8 flex w-full justify-center">
        <ItemSearchInput autoFocus />
      </div>

      <p className="mt-6 text-sm text-neutral-500">
        Vous préférez comparer plusieurs objets à la fois ?{" "}
        <Link
          href="/prices"
          className="font-medium text-amber-500 hover:text-amber-400"
        >
          Utilisez l&apos;outil de vérification des prix
        </Link>{" "}
        ou consultez les{" "}
        <Link
          href="/top-traded"
          className="font-medium text-amber-500 hover:text-amber-400"
        >
          objets les plus échangés
        </Link>
        .
      </p>

      <div className="mt-14 w-full">
        <h2 className="mb-3 text-sm font-medium text-neutral-300">Favoris</h2>
        <FavoritesList />
      </div>

      <p className="mt-16 text-xs text-neutral-600">
        Données de marché fournies par The Albion Online Data Project.
        Icônes d&apos;objets fournies par Albion Online.
      </p>
    </div>
  );
}
