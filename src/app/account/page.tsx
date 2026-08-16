import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { CharacterList } from "@/components/CharacterList";
import { TokenManager } from "@/components/TokenManager";

export default async function AccountPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    redirect("/");
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-1 text-xl font-semibold text-neutral-100">
        Mon compte
      </h1>
      <p className="mb-8 text-sm text-neutral-500">
        Connecté en tant que {session.user.name}.
      </p>

      <section>
        <h2 className="mb-2 text-sm font-medium text-neutral-300">
          Jetons API pour le client lourd
        </h2>
        <p className="mb-4 text-sm text-neutral-500">
          Générez un jeton pour connecter le{" "}
          <a
            href="https://github.com/Rabhynoide/TrimsSilver-client"
            className="text-amber-500 hover:text-amber-400"
          >
            client lourd
          </a>{" "}
          à votre compte. Le jeton n&apos;est affiché qu&apos;une seule fois :
          copiez-le immédiatement.
        </p>
        <TokenManager />
      </section>

      <section className="mt-10">
        <h2 className="mb-2 text-sm font-medium text-neutral-300">
          Personnages
        </h2>
        <p className="mb-4 text-sm text-neutral-500">
          Compétences de vie (récolte/craft) remontées par le client lourd,
          en lecture seule.
        </p>
        <CharacterList />
      </section>
    </div>
  );
}
