# Gestion de Bibliothèque en Ligne — Architecture 3‑tiers & Microservices

> Stack : **FastAPI (Python)** pour les microservices, **SQLite** (peut être remplacé par MySQL/PostgreSQL), **Express (Node.js)** pour l’API Gateway, **React (Vite)** pour le front. **Docker Compose** fourni.

## Aperçu de l’architecture
- **Couche Présentation (Front)** : React (Vite) — pages : Liste des livres, Détails livre, Liste des emprunts, Détails emprunt, Formulaire d’emprunt.
- **Couche Métier** : 2 microservices FastAPI
  - `catalog-service` : CRUD livres (titre, auteur, catégorie, total_copies, available_copies).
  - `loans-service` : Emprunts/retours (crée un emprunt si `available_copies > 0`, met à jour le catalogue via REST call, gère le retour).
- **Couche Données** : Chaque microservice a sa **propre base** SQLite (fichiers locaux). Peut être pointé vers MySQL/PostgreSQL via variables d’environnement/SQLAlchemy.
- **Communication** : REST/JSON entre services; l’**API Gateway** proxy les routes `/api/catalog/*` et `/api/loans/*` vers les services.
- **Bonus** : Dockerfiles + `docker-compose.yml` pour lancer l’ensemble.

Voir le schéma visuel `docs/architecture.png`.

---

## Démarrage rapide (sans Docker)

### 1) Lancer les microservices
Dans deux terminaux :

```bash
# Terminal A - catalog
cd services/catalog-service
python -m venv .venv && source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
export PORT=8001
export DATABASE_URL=sqlite:///./catalog.db
uvicorn app:app --host 0.0.0.0 --port ${PORT}

# Terminal B - loans
cd services/loans-service
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
export PORT=8002
export DATABASE_URL=sqlite:///./loans.db
export CATALOG_URL=http://localhost:8001
uvicorn app:app --host 0.0.0.0 --port ${PORT}
```

### 2) Lancer l’API Gateway
```bash
cd gateway
npm install
# Variables par défaut dans .env (PORT=8080, CATALOG_URL=http://localhost:8001, LOANS_URL=http://localhost:8002)
npm start
```

### 3) Lancer le Front (React)
```bash
cd frontend
npm install
npm run dev
# Front accessible sur http://localhost:5173
# Le front consomme l’API via la gateway: http://localhost:8080/api/*
```

---

## Démarrage avec Docker (recommandé)
```bash
docker compose up --build
# Front sur http://localhost:5173
# API Gateway sur http://localhost:8080
# Services: catalog http://catalog:8001 , loans http://loans:8002 (réseau interne Docker)
```

---

## Endpoints principaux

### Catalog Service (`/books`)
- `GET /books` — liste (query: `q` pour recherche titre/auteur/catégorie).
- `GET /books/{id}` — détails.
- `POST /books` — créer `{title, author, category, total_copies, available_copies}`.
- `PUT /books/{id}` — mettre à jour.
- `DELETE /books/{id}` — supprimer.

### Loans Service
- `GET /loans` — liste
- `GET /loans/{id}` — détails
- `POST /loans` — créer un emprunt `{user_id, book_id}` (vérifie disponibilité via Catalog; décrémente)
- `POST /loans/{id}/return` — retour de livre (marque `returned_at`, incrémente disponibilité)

---

## Données & Modèles
- **Book**: `id, title, author, category, total_copies, available_copies, created_at`
- **Loan**: `id, user_id, book_id, borrowed_at, due_at, returned_at`

> NB: La gestion de comptes/roles **n’est pas exigée** (hors scope).

---

## Tests rapides (Postman/cURL)
```bash
# Ajouter un livre
curl -X POST http://localhost:8080/api/catalog/books -H "Content-Type: application/json" -d '{"title":"Clean Code","author":"Robert C. Martin","category":"Software","total_copies":5,"available_copies":5}'

# Lister
curl http://localhost:8080/api/catalog/books

# Emprunter
curl -X POST http://localhost:8080/api/loans/loans -H "Content-Type: application/json" -d '{"user_id":1,"book_id":1}'
```

---

## Personnalisation Base de Données
Changer `DATABASE_URL` (ex: `postgresql+psycopg2://user:pwd@host/db`) dans les variables d’environnement des services.

---

## Structure du repo
```
online-library-microservices/
├─ docs/
│  ├─ architecture.png
│  └─ architecture.md
├─ gateway/ (Express)
├─ services/
│  ├─ catalog-service/ (FastAPI + SQLite)
│  └─ loans-service/   (FastAPI + SQLite)
└─ frontend/ (React + Vite)
```
