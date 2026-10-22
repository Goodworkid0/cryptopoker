# CryptoPoker

Multiplayer poker and wallet integration prototype with smart-contract experiments.

Solo-developed by [Vojislav Beric](https://github.com/Smileyface101).

## What it does

- NestJS multiplayer API, Next.js interface and Prisma persistence.
- Wallet authentication and Socket.IO communication.
- Solidity/Hardhat token, faucet and vault experiments for local/test networks.

## Stack

TypeScript · NestJS · Next.js · PostgreSQL · Redis · Solidity

## Getting started

Use Node.js and pnpm. Configure `.env.example` for local PostgreSQL, Redis and test-network services before running the applications.

```sh
pnpm install
cp .env.example .env
pnpm --filter @cryptopoker/api db:generate
pnpm dev
```

`apps/api/` contains the backend and Prisma schema, `apps/web/` the interface, and `apps/contracts/` the Hardhat project. Local/test deployment addresses are examples. The contracts and wallet flows are experiments, not audited financial infrastructure.

## Project status

Initial public source snapshot. Python syntax and source manifests were checked for publication; full application, infrastructure and external-service integration tests have not been run for this release. Local credentials, databases, sessions, uploaded content and machine-specific deployment files are excluded.

## License

Original project code is available under the [MIT License](LICENSE). External dependencies retain their respective licences.
