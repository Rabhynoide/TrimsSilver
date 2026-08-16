# Contrat d'API — client lourd → TrimsSilver

> **Statut : authentification + premier endpoint d'ingestion (compétences de personnage) implémentés.** Ce document est la référence unique du contrat entre le [client lourd](https://github.com/Rabhynoide/TrimsSilver-client) (interception de paquets réseau du jeu) et l'API/DB en ligne de ce repo. À compléter au fur et à mesure des décisions prises sur [TrimsSilver#5](https://github.com/Rabhynoide/TrimsSilver/issues/5) (côté API) et [TrimsSilver-client#1-4](https://github.com/Rabhynoide/TrimsSilver-client/issues) (côté client).
>
> Le client lourd ne doit pas dupliquer ce contrat dans son propre repo : il y renvoie un lien (voir son README).

## Portée

Ce que le client envoie à l'API, dans quel format, et comment il s'authentifie. Ne couvre pas l'authentification web des utilisateurs du site (comptes/portefeuille, voir TrimsSilver#5 pour cette partie-là séparément).

## Base URL et versioning

**Implémenté.** `https://<domaine-du-site>/api/client/v1/...` — sous-espace dédié des routes API existantes, versionné dès le départ puisqu'un client distribué en binaire ne peut pas être mis à jour aussi vite que le site.

## Authentification

**Implémenté.** Le site utilise [Better Auth](https://www.better-auth.com/) avec Discord comme unique provider OAuth pour les comptes web (voir `src/lib/auth.ts`). Le client lourd, lui, **n'utilise pas cet OAuth directement** : il s'authentifie avec un jeton personnel généré depuis le site.

- L'utilisateur se connecte sur le site (Discord OAuth), puis génère un jeton depuis `/account` (page `src/app/account/page.tsx`, UI dans `src/components/TokenManager.tsx`).
- Le jeton est affiché **une seule fois**, à sa création (`POST /api/account/tokens`) — seul son hash SHA-256 est stocké en base (table `client_token`, voir `src/lib/db/schema.ts`), jamais la valeur en clair.
- Le client lourd envoie ce jeton dans toutes ses requêtes vers l'API d'ingestion : `Authorization: Bearer <jeton>`.
- Le jeton est donc **lié à un compte utilisateur du site** (pas anonyme par installation) — les données envoyées par le client sont rattachées à ce compte.
- Révocation : depuis `/account`, à tout moment (`DELETE /api/account/tokens/{id}`) — passe `revoked_at` à non-nul, le jeton est immédiatement rejeté.
- Rotation : pas de rotation automatique pour l'instant — l'utilisateur révoque et régénère manuellement.
- Rate limiting par jeton : **pas encore fait**, à ajouter quand un vrai endpoint d'ingestion existera (voir Endpoints ci-dessous).

Vérification côté serveur : `verifyClientToken(request)` dans `src/lib/auth/clientTokens.ts` — à réutiliser tel quel par tout futur endpoint d'ingestion. Elle lit l'en-tête `Authorization`, hash le jeton reçu, le compare au hash stocké, vérifie qu'il n'est pas révoqué, et met à jour `last_used_at`.

Endpoints concernés côté site :
- `GET /api/account/tokens` — liste les jetons de l'utilisateur connecté (jamais le jeton en clair, seulement id/nom/dates).
- `POST /api/account/tokens` — crée un jeton, `{ name?: string }` → `{ id, name, token }` (le jeton en clair, une seule fois).
- `DELETE /api/account/tokens/{id}` — révoque un jeton (doit appartenir à l'utilisateur connecté).

## Endpoints

### `POST /api/client/v1/sync` — **Implémenté**

Synchronise un personnage et le niveau actuel de ses compétences de vie (récolte/craft — bûcheronnage, minage, tissage, dépeçage, carrière, agriculture, pêche, cuisine, alchimie, forge, etc.), par palier (ex. Adepte, Expert, Maître...).

- **Auth** : `Authorization: Bearer <jeton>` (voir section Authentification ci-dessus). 401 si absent/invalide/révoqué.
- **Corps** (validé par zod, voir `src/lib/client-sync/schemas.ts`) :
  ```json
  {
    "character": { "name": "NomDuPersonnage" },
    "skills": [
      { "key": "GATHER_ORE_T4", "level": 51 },
      { "key": "CRAFT_REFINE_ORE_T4", "level": 45 }
    ]
  }
  ```
  - `character.name` : 1 à 64 caractères.
  - `skills` : 0 à 200 entrées. `key` est une chaîne libre — c'est l'id d'achievement tel qu'il apparaît dans `achievements.xml` (ao-bin-dumps), pas un enum figé côté site, ce catalogue étant large et évoluant avec les patchs du jeu. `level` un entier entre 0 et 120 : le niveau actuel dans ce palier, pas la fame cumulée (voir Journal des changements pour le raisonnement).
- **Comportement** : upsert. Le personnage est créé s'il n'existe pas (rattaché au compte propriétaire du jeton) ; les noms de personnage sont uniques globalement (comme dans le jeu), donc si `character.name` appartient déjà à un autre compte, la requête échoue en 409. Chaque compétence est upsertée par `(characterId, skillKey)` — la valeur de `level` est simplement remplacée, pas de fusion/max.
- **Réponse succès** (200) : `{ "characterId": string, "skillsSynced": number }`.
- **Erreurs** : 401 (jeton), 400 (`{ error, issues }`, payload invalide), 409 (personnage déjà lié à un autre compte), 5xx (erreur serveur).

Le personnage et ses compétences sont visibles en lecture seule sur `/account` (`GET /api/account/characters`, authentifié par session web, pas par jeton — distinct de l'endpoint client).

À prévoir plus tard : d'autres endpoints d'ingestion (ex. prix vus en jeu) suivraient le même schéma d'auth/versioning.

## Format des payloads

**Implémenté pour la sync de compétences** (voir ci-dessus). Pour de futurs payloads (ex. prix), s'aligner avec les types déjà utilisés côté site pour les prix/historique (voir `src/types/albion.ts`) plutôt que d'inventer un format parallèle, dans la mesure du possible.

## Gestion des erreurs et limites

_À définir._ Comportement attendu du client en cas de 401/429/5xx (retry, backoff, mise en file locale). Rate limiting par jeton pas encore fait.

## Journal des changements

- 2026-08-16 : création du squelette, aucune décision technique prise.
- 2026-08-16 : authentification implémentée (Better Auth + Discord côté web, jetons personnels hashés pour le client lourd). Base URL/versioning, endpoints d'ingestion et format des payloads restent à définir.
- 2026-08-16 : premier endpoint d'ingestion réel, `POST /api/client/v1/sync` (compétences de vie). Le mapping event Photon → compétence reste à découvrir côté client (outil de découverte livré dans TrimsSilver-client, voir son README) avant que le client puisse réellement appeler cet endpoint avec de vraies données.
- 2026-08-16 : le payload envoie le **niveau actuel** par palier (`level`, 0-120) plutôt que la fame cumulée. Le mécanisme trouvé côté client (`FullAchievementInfo`, event Photon 151) donne directement ce niveau par compétence — inutile de faire remonter aussi la fame pour l'objectif visé (calcul du rendement de craft), donc le champ `fame` est retiré du contrat plutôt que gardé en plus.
