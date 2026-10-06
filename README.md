# Travelling Next

Travelling Next is the customer and provider frontend for discovering travel listings across South Korea. It is a Next.js Pages Router application using React, Material UI, SCSS, Apollo Client, and the Travelling product-only GraphQL API.

## Requirements

- Node.js compatible with Next.js 14
- Yarn 1.x
- Travelling backend available at `http://localhost:3007`

## Setup

```bash
yarn install --frozen-lockfile
yarn dev
```

The application uses these environment variables:

```env
REACT_APP_API_URL=http://localhost:3007
REACT_APP_API_GRAPHQL_URL=http://localhost:3007/graphql
REACT_APP_CHAT_WS_URL=ws://localhost:3007
```

Apollo uses the GraphQL URL for queries, mutations, authentication, and uploads. Chat continues to use its separate raw WebSocket URL.

## Validation

```bash
yarn tsc --noEmit --incremental false
yarn build
```

Canonical catalog routes are `/products`, `/providers`, and `/_admin/products`. Legacy property and agent routes are retained only as permanent redirects.
