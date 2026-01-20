# Initiatives Citoyennes 2026 — Frontend

Landing page officielle de l’initiative citoyenne « Initiatives Citoyennes 2026 ».
Ce site permet la consultation du projet et l’inscription des participants, avec un compteur dynamique connecté à une API sécurisée.

---

## 🌍 URL de production
https://mre20252026.github.io/initiatives-citoyennes-2026/

---

## ⚙️ Fonctionnalités principales
- Landing page multilingue
- Formulaire d’inscription
- Compteur de pré-inscriptions en temps réel
- Connexion à une API externe sécurisée
- Compatible desktop / mobile

---

## 🔌 Dépendance API
Le frontend consomme l’API suivante :

- **API Render**  
  https://initiatives-citoyennes-2026-api-1.onrender.com
- Endpoints utilisés :
  - `GET /count` → compteur global
  - `POST /signup` → inscription utilisateur

---

## 🧪 Lancer en local (recommandé)
Le site doit être servi en HTTP (éviter `file://`).

```bash
cd initiatives-citoyennes-2026
python3 -m http.server 5173
