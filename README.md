# SnippetAI_Backend

Backend per la gestione di snippet di codice, costruito con Node.js TypeORM e Posgtgres

Il Software è costruito a scopo dimostrativo , si inzia con un ambiente Single Thread con una feature base , fino poi ad aggiungere diverse feature e migliorare quelle base attraverso AI , AWS , ecc. 

## Version
- Node version: v24.11.1
- Database: Postgres 18.2 (Docker)

## Teach Stack
- Runtime: Node js + Typescript
- Database : Postgres
- ORM : typeORM
- Testing: Vitest
- Container: Docker
- 
## Setup
### Requisito
- Docker

### .ENV

    POSTGRES_USER= 
    POSTGRES_PASSWORD= 
    POSTGRES_DB=
    OPENAI_API_KEY = 
    USEAITEST=

Le env servono per le credenziali postgres e per usare openAI

## Avvio
    docker compose up -d
    
    npm run start


# Struttura
## Docker
Ho usato una build multi-stage: compiliamo in TypeScript, puliamo le dipendenze di sviluppo e creiamo un'immagine finale leggera che contiene solo il compilato JavaScript. Sicurezza e performance al top.

## Altro
Al momento il ReadMe deve essere ancora finito
