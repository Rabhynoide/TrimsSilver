# AlbionMarket

Site de suivi du marché pour le jeu [Albion Online](https://albiononline.com/), inspiré de [albionfreemarket.com](https://albionfreemarket.com/). Construit avec Next.js (App Router, TypeScript, Tailwind CSS).

## Fonctionnalités

- Recherche d'objets avec autocomplete
- Vérification des prix (`/prices`) : comparaison multi-objets, par ville et par qualité, sélection persistée
- Page détail d'un objet (`/items/[uniqueName]`) : prix actuels + historique (horaire / 6h / journalier)
- `/top-traded` : classement des ressources brutes par volume échangé récent
- Favoris (accueil) persistés dans le navigateur
- Sélecteur de région (Europe / Amériques / Asie)
- Comptes utilisateurs (connexion Discord) et gestion de jetons API personnels pour le [client lourd](https://github.com/Rabhynoide/TrimsSilver-client) (`/account`)

Les fonctionnalités à venir (calculateurs de craft, portefeuille, alertes de prix, carte interactive, etc.) sont suivies via les [issues](https://github.com/Rabhynoide/TrimsSilver/issues) et les milestones du dépôt.

## Sources de données

- Prix et historique de marché : [The Albion Online Data Project](https://www.albion-online-data.com/) (API publique communautaire)
- Métadonnées des objets (noms, tiers) : [ao-bin-dumps](https://github.com/broderickhyman/ao-bin-dumps)
- Icônes d'objets : service de rendu officiel `render.albiononline.com`

## Prérequis

- Node.js 22+
- Docker (Postgres local ou stack complète, voir plus bas)
- Une application [Discord Developer Portal](https://discord.com/developers/applications) pour l'OAuth (callback à enregistrer : `<BETTER_AUTH_URL>/api/auth/callback/discord`, ex. `http://localhost:3000/api/auth/callback/discord` en dev)

## Configuration

```bash
cp .env.example .env
```

Puis renseigner les variables dans `.env` (voir les commentaires du fichier) : identifiants Postgres, `BETTER_AUTH_SECRET` (générer avec `openssl rand -base64 32`), `BETTER_AUTH_URL`, `DISCORD_CLIENT_ID`/`DISCORD_CLIENT_SECRET`. Tous les ports (`APP_PORT`, `POSTGRES_PORT`) sont configurables pour cohabiter avec d'autres services sur le même hôte Docker.

## Démarrer

### Option A — stack complète via Docker (recommandé pour un serveur/Portainer)

```bash
docker compose up -d --build
```

Lance Postgres et l'app (image construite depuis le `Dockerfile`, sortie Next.js `standalone`). Les migrations Drizzle s'appliquent automatiquement au démarrage du conteneur `app` (voir `src/instrumentation.ts`). Le site est ensuite joignable sur `http://<hôte>:${APP_PORT}`.

### Option B — app en local, Postgres en Docker

```bash
docker compose up -d db
npm install
npm run db:migrate
npm run dev
```

Dans ce cas, `DATABASE_URL` dans `.env` doit pointer sur `localhost:${POSTGRES_PORT}` plutôt que sur `db` (voir commentaire dans `.env.example`).

Ouvrir [http://localhost:3000](http://localhost:3000).

## Autres commandes

```bash
npm run lint        # ESLint
npm run build       # build de production
npm run test        # tests unitaires (Vitest)
npm run test:watch  # tests unitaires en mode watch
npm run test:e2e    # tests end-to-end (Playwright, démarre le serveur de dev automatiquement)
npm run db:generate # génère une migration Drizzle à partir de src/lib/db/schema.ts
npm run db:migrate  # applique les migrations en attente
npm run db:studio   # explorateur de données Drizzle Studio
```
