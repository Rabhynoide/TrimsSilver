# Contrat d'API — client lourd → TrimsSilver

> **Statut : authentification implémentée, endpoints d'ingestion pas encore.** Ce document est la référence unique du contrat entre le [client lourd](https://github.com/Rabhynoide/TrimsSilver-client) (interception de paquets réseau du jeu) et l'API/DB en ligne de ce repo. À compléter au fur et à mesure des décisions prises sur [TrimsSilver#5](https://github.com/Rabhynoide/TrimsSilver/issues/5) (côté API) et [TrimsSilver-client#1-4](https://github.com/Rabhynoide/TrimsSilver-client/issues) (côté client).
>
> Le client lourd ne doit pas dupliquer ce contrat dans son propre repo : il y renvoie un lien (voir son README).

## Portée

Ce que le client envoie à l'API, dans quel format, et comment il s'authentifie. Ne couvre pas l'authentification web des utilisateurs du site (comptes/portefeuille, voir TrimsSilver#5 pour cette partie-là séparément).

## Base URL et versioning

_À définir._ Probablement `https://<domaine-du-site>/api/client/v1/...` (sous-espace dédié des routes API existantes, versionné dès le départ puisqu'un client distribué en binaire ne peut pas être mis à jour aussi vite que le site).

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

_À définir._ Prévoir a minima :

- `POST /api/client/v1/ingest` (nom provisoire) — soumission de données observées (prix vus en jeu, transactions, etc.)

Chaque endpoint devra documenter ici : méthode, chemin, en-têtes requis, schéma du corps de requête, réponse de succès, codes d'erreur.

## Format des payloads

_À définir._ À aligner avec les types déjà utilisés côté site pour les prix/historique (voir `src/types/albion.ts`) plutôt que d'inventer un format parallèle, dans la mesure du possible.

## Gestion des erreurs et limites

_À définir._ Comportement attendu du client en cas de 401/429/5xx (retry, backoff, mise en file locale).

## Journal des changements

- 2026-08-16 : création du squelette, aucune décision technique prise.
- 2026-08-16 : authentification implémentée (Better Auth + Discord côté web, jetons personnels hashés pour le client lourd). Base URL/versioning, endpoints d'ingestion et format des payloads restent à définir.
