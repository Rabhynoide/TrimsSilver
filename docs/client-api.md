# Contrat d'API — client lourd → TrimsSilver

> **Statut : squelette, rien n'est implémenté.** Ce document est la référence unique du contrat entre le [client lourd](https://github.com/Rabhynoide/TrimsSilver-client) (interception de paquets réseau du jeu) et l'API/DB en ligne de ce repo. À remplir au fur et à mesure des décisions prises sur [TrimsSilver#5](https://github.com/Rabhynoide/TrimsSilver/issues/5) (côté API) et [TrimsSilver-client#1-4](https://github.com/Rabhynoide/TrimsSilver-client/issues) (côté client).
>
> Le client lourd ne doit pas dupliquer ce contrat dans son propre repo : il y renvoie un lien (voir son README).

## Portée

Ce que le client envoie à l'API, dans quel format, et comment il s'authentifie. Ne couvre pas l'authentification web des utilisateurs du site (comptes/portefeuille, voir TrimsSilver#5 pour cette partie-là séparément).

## Base URL et versioning

_À définir._ Probablement `https://<domaine-du-site>/api/client/v1/...` (sous-espace dédié des routes API existantes, versionné dès le départ puisqu'un client distribué en binaire ne peut pas être mis à jour aussi vite que le site).

## Authentification

_À définir sur TrimsSilver#5 et TrimsSilver-client#3._

Piste de départ : jeton machine-à-machine (API key par installation ou par compte joueur, envoyée en en-tête `Authorization`), distinct du système d'auth web (cookies/session) prévu pour le portefeuille utilisateur. À trancher :
- Le jeton est-il lié à un compte utilisateur du site, ou anonyme par installation ?
- Génération/rotation/révocation du jeton
- Rate limiting par jeton

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
