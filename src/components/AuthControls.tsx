"use client";

import Link from "next/link";
import { signIn, signOut, useSession } from "@/lib/auth-client";

export function AuthControls() {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return <div className="h-8 w-8 animate-pulse rounded-full bg-neutral-800" />;
  }

  if (!session) {
    return (
      <button
        type="button"
        onClick={() => signIn.social({ provider: "discord", callbackURL: "/" })}
        className="rounded-lg border border-neutral-700 px-3 py-1.5 text-sm text-neutral-300 transition-colors hover:text-neutral-100"
      >
        Se connecter avec Discord
      </button>
    );
  }

  return (
    <div className="flex items-center gap-3 text-sm">
      <Link
        href="/account"
        className="flex items-center gap-2 text-neutral-300 transition-colors hover:text-neutral-100"
      >
        {session.user.image && (
          // eslint-disable-next-line @next/next/no-img-element -- avatar from Discord's CDN, not a static asset
          <img
            src={session.user.image}
            alt={session.user.name}
            width={24}
            height={24}
            className="rounded-full"
          />
        )}
        {session.user.name}
      </Link>
      <button
        type="button"
        onClick={() => signOut()}
        className="text-neutral-500 transition-colors hover:text-neutral-200"
      >
        Déconnexion
      </button>
    </div>
  );
}
