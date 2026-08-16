"use client";

import { useQuery } from "@tanstack/react-query";

interface CharacterSkill {
  id: string;
  skillKey: string;
  fame: number;
  updatedAt: string;
}

interface CharacterSummary {
  id: string;
  name: string;
  lastSyncedAt: string;
  skills: CharacterSkill[];
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatFame(value: number) {
  return new Intl.NumberFormat("fr-FR").format(value);
}

export function CharacterList() {
  const { data, isLoading } = useQuery({
    queryKey: ["characters"],
    queryFn: async () => {
      const res = await fetch("/api/account/characters");
      if (!res.ok) throw new Error("Impossible de charger les personnages");
      const json = (await res.json()) as { characters: CharacterSummary[] };
      return json.characters;
    },
  });

  const characters = data ?? [];

  if (isLoading) {
    return <p className="text-sm text-neutral-500">Chargement...</p>;
  }

  if (characters.length === 0) {
    return (
      <p className="text-sm text-neutral-500">
        Aucun personnage synchronisé pour l&apos;instant. Utilisez le{" "}
        <a
          href="https://github.com/Rabhynoide/TrimsSilver-client"
          className="text-amber-500 hover:text-amber-400"
        >
          client lourd
        </a>{" "}
        avec un jeton généré ci-dessus pour envoyer vos compétences.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {characters.map((char) => {
        const skills = [...char.skills].sort((a, b) =>
          a.skillKey.localeCompare(b.skillKey)
        );

        return (
          <div
            key={char.id}
            className="rounded-lg border border-neutral-800 p-4"
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-medium text-neutral-100">{char.name}</h3>
              <span className="text-xs text-neutral-500">
                Synchronisé le {formatDate(char.lastSyncedAt)}
              </span>
            </div>
            {skills.length === 0 ? (
              <p className="text-sm text-neutral-500">
                Aucune compétence reçue pour ce personnage.
              </p>
            ) : (
              <ul className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-3">
                {skills.map((skill) => (
                  <li
                    key={skill.id}
                    className="flex justify-between rounded bg-neutral-900 px-2 py-1"
                  >
                    <span className="text-neutral-400">{skill.skillKey}</span>
                    <span className="text-neutral-200">
                      {formatFame(skill.fame)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}
