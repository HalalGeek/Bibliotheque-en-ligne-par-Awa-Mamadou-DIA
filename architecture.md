# Schéma & Description d’Architecture

```mermaid
flowchart LR
  subgraph Presentation[Couche Présentation]
    FE[React Frontend]
  end

  subgraph Business[ Couche Métier (Microservices) ]
    CAT[Catalog Service (FastAPI)]
    LOAN[Loans Service (FastAPI)]
  end

  subgraph Data[Couche Données]
    DB1[(SQLite Catalog)]
    DB2[(SQLite Loans)]
  end

  FE -- REST via API Gateway --> GW[API Gateway (Express)]
  GW -- /api/catalog/* --> CAT
  GW -- /api/loans/* --> LOAN
  CAT -- SQLAlchemy --> DB1
  LOAN -- SQLAlchemy --> DB2
  LOAN -- vérifie disponibilité --> CAT
```
