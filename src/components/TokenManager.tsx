"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

interface TokenSummary {
  id: string;
  name: string;
  createdAt: string;
  lastUsedAt: string | null;
  revokedAt: string | null;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

export function TokenManager() {
  const queryClient = useQueryClient();
  const [newTokenName, setNewTokenName] = useState("");
  const [revealedToken, setRevealedToken] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["client-tokens"],
    queryFn: async () => {
      const res = await fetch("/api/account/tokens");
      if (!res.ok) throw new Error("Impossible de charger les jetons");
      const json = (await res.json()) as { tokens: TokenSummary[] };
      return json.tokens;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (name: string) => {
      const res = await fetch("/api/account/tokens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error("Impossible de créer le jeton");
      return (await res.json()) as { id: string; name: string; token: string };
    },
    onSuccess: (result) => {
      setRevealedToken(result.token);
      setNewTokenName("");
      queryClient.invalidateQueries({ queryKey: ["client-tokens"] });
    },
  });

  const revokeMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/account/tokens/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Impossible de révoquer le jeton");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client-tokens"] });
    },
  });

  const tokens = (data ?? []).filter((token) => !token.revokedAt);

  return (
    <div className="space-y-4">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          createMutation.mutate(newTokenName || "Client lourd");
        }}
        className="flex gap-2"
      >
        <input
          value={newTokenName}
          onChange={(event) => setNewTokenName(event.target.value)}
          placeholder="Nom du jeton (ex. PC principal)"
          className="flex-1 rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-500 focus:border-amber-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={createMutation.isPending}
          className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-neutral-950 hover:bg-amber-400 disabled:opacity-50"
        >
          Générer
        </button>
      </form>

      {revealedToken && (
        <div className="rounded-lg border border-amber-500/50 bg-amber-500/10 p-3 text-sm">
          <p className="mb-2 text-amber-400">
            Copiez ce jeton maintenant, il ne sera plus jamais affiché :
          </p>
          <code className="block break-all rounded bg-neutral-950 p-2 text-neutral-100">
            {revealedToken}
          </code>
        </div>
      )}

      {isLoading && <p className="text-sm text-neutral-500">Chargement...</p>}

      {!isLoading && tokens.length === 0 && (
        <p className="text-sm text-neutral-500">Aucun jeton actif.</p>
      )}

      {tokens.length > 0 && (
        <ul className="divide-y divide-neutral-800 rounded-lg border border-neutral-800">
          {tokens.map((token) => (
            <li
              key={token.id}
              className="flex items-center justify-between px-4 py-3 text-sm"
            >
              <div>
                <p className="text-neutral-200">{token.name}</p>
                <p className="text-xs text-neutral-500">
                  Créé le {formatDate(token.createdAt)}
                  {token.lastUsedAt &&
                    ` · dernière utilisation le ${formatDate(token.lastUsedAt)}`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => revokeMutation.mutate(token.id)}
                className="text-red-400 hover:text-red-300"
              >
                Révoquer
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
