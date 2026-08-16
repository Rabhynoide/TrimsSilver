# AlbionMarket

Site de suivi du marché pour le jeu [Albion Online](https://albiononline.com/), inspiré de [albionfreemarket.com](https://albionfreemarket.com/). Construit avec Next.js (App Router, TypeScript, Tailwind CSS).

## Fonctionnalités (Phase 1)

- Recherche d'objets avec autocomplete
- Vérification des prix (`/prices`) : comparaison multi-objets, par ville et par qualité
- Page détail d'un objet (`/items/[uniqueName]`) : prix actuels + historique (horaire / 6h / journalier)
- Sélecteur de région (Europe / Amériques / Asie)

Les fonctionnalités à venir (calculateurs de craft, comptes utilisateurs, carte interactive, etc.) sont suivies via les [issues](https://github.com/Rabhynoide/TrimsSilver/issues) et les milestones du dépôt.

## Sources de données

- Prix et historique de marché : [The Albion Online Data Project](https://www.albion-online-data.com/) (API publique communautaire)
- Métadonnées des objets (noms, tiers) : [ao-bin-dumps](https://github.com/broderickhyman/ao-bin-dumps)
- Icônes d'objets : service de rendu officiel `render.albiononline.com`

## Démarrer

```bash
npm install
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

## Autres commandes

```bash
npm run lint       # ESLint
npm run build      # build de production
npm run test       # tests unitaires (Vitest)
npm run test:watch # tests unitaires en mode watch
npm run test:e2e   # tests end-to-end (Playwright, démarre le serveur de dev automatiquement)
```
