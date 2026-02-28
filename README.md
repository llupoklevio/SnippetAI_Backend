# SnippetAI_Backend

Software per la gestione di codice, il software è costruito a scopo dimostrativo  e segue un percorso incrementale: 
si parte da un'architettura base con feature minime per poi evolvere in un software di gestione dei progetti con alta scalabilità

---

28-02-2026

Il software attualmente è un single thread che permette di aprire più connessioni, le connessioni possono essere verso diversi db (relazionali) o diversi schemi.\
Zod usato per fare tipizzazione e generare in maniera quasi automatica lo swagger\
Momentaneamente AI è usata per generare edge case nei test e per eseguire test di tipologia E2E\


Le feature base attualmente non sono ancora state implementate, in questo momento si ha solo autenticazione 

Lo scopo del progetto è dimostrare le mie capacità: non solo dal punto di vista delle feature, ma anche dalla pulizia del codice, dell'architettura, dei pattern applicati 
(come la Dependency Injection per separare la dipendenza tra repository e controller/service), della scalabilità e dell'integrazione di nuove librerie.
Una mentalità maturata attraverso il percorso universitario e la mia esperienza nel mondo lavorativo.

Nel breve futuro si ha in programma di integrare BullMQ, architettura Event-Driven e ambiente Cloud

---


## Teach Stack
| Layer                | Tecnologia                         |
|----------------------|------------------------------------|
| Runtime              | Node.js v24 + TypeScript           |
| Framework            | Express 5                          |
| Database             | PostgreSQL 17                      |
| ORM                  | TypeORM                            |
| Autenticazione       | JWT (jsonwebtoken + express-jwt)   |
| Hashing password     | Argon2id                           |
| Validazione          | Zod                                |
| Documentazione API   | Zod → OpenAPI (swagger-ui-express) |
| Logging              | Pino + pino-http                   |
| Rate Limiting        | express-rate-limit                 |
| AI                   | LangChain + OpenAI GPT-4.1         |
| Testing              | Vitest + Supertest                 |
| Container            | Docker (multi-stage build)         |
| Dipendency Injection | Awilix                             | 

---

## Setup

La modalità production è attualmente in sviluppo. Le migrazioni TypeORM non sono ancora state implementate. Il deploy in produzione è previsto nelle prossime versioni.

### Requisito
- Docker

### .ENV

Crea un file `.env` nella root del progetto:

| Variabile | Descrizione | Esempio |
|-----------|-------------|---------|
| `PORT_SERVER` | Porta su cui gira il server | `3000` |
| `POSTGRES_USER` | Utente PostgreSQL | `postgres` |
| `POSTGRES_PASSWORD` | Password PostgreSQL | `password` |
| `POSTGRES_PORT` | Porta PostgreSQL | `5433` |
| `POSTGRES_HOST` | Host PostgreSQL | `localhost` |
| `POSTGRES_DB` | Nome del database principale | `snippetai_Valutation` |
| `SCHEMA_DEV` | Schema per l'ambiente di sviluppo | `snippetaidev` |
| `SCHEMA_PROD` | Schema per l'ambiente di produzione | `snippetaiprod` |
| `POSTGRES_TEST` | Nome del database per i test | `snippetaitest` |
| `OPENAI_API_KEY` | Chiave API OpenAI (necessaria solo per `test:ai`) | `sk-...` |
| `SECRET_JWT` | Secret per la firma dei JWT | `testSecret` |
| `JWT_ACC_EXPIRES_MIN` | Durata in minuti dell'access token | `5` |
| `JWT_REF_EXPIRES_MIN` | Durata in minuti del refresh token | `30` |
| `USEAITEST` | Abilita i test con AI (`true`/`false`) | `false` |

## Avvio

### Sviluppo

```bash
# Avvia il database PostgreSQL
docker compose up -d

# Installa le dipendenze
npm install

# Avvia il server in modalità sviluppo (hot reload)
npm run dev
```

### Documentazione

```
GET /api-docs
```

Disponibile solo in ambiente `development`. Interfaccia Swagger generata automaticamente dallo schema Zod.

---

## Autenticazione

Il sistema usa una strategia a doppio token:

- **Access Token** — JWT di breve durata (scadenza configurabile via `JWT_ACC_EXPIRES_MIN`). Va inviato come `Authorization: Bearer <token>` nelle route protette.
- **Refresh Token** — JWT di lunga durata, salvato nel database. Viene usato per ottenere un nuovo access token tramite `GET /auth/refresh`.

Le password sono hashate con Argon2id

---

## Testing

```bash
# Esegui tutti i test
npm test

# Interfaccia UI dei test
npm run test:ui

# Test con scenari AI edge case (richiede OPENAI_API_KEY)
npm run test:ai
```
Il database di test viene creato automaticamente prima di ogni suite e distrutto alla fine. Non serve configurazione aggiuntiva oltre al `.env`.


