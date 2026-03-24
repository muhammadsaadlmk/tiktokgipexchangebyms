# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   ├── api-server/         # Express API server
│   └── tiktok-exchange/    # React + Vite frontend (TikTok Followers Exchange)
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── tsconfig.json
└── package.json
```

## Application: TikTok Followers Exchange

A social exchange platform where users follow each other's TikTok accounts to gain points.

### Features
- Email + password authentication (cookie-based sessions)
- TikTok username registration
- Follow/unfollow system with points exchange
- 10 points given on registration
- Following someone gives them +1 point; unfollowing takes -1 point
- Admin panel for full user management (edit, delete, view stats)

### Database Schema
- `users` — id, email, password_hash, tiktok_username, points (default 10), is_admin, created_at
- `follows` — id, follower_id, following_id, created_at (unique constraint)
- `sessions` — id, session_token, user_id, created_at, expires_at

### API Routes (all under /api)
- `POST /api/auth/register` — register with email, password, tiktokUsername
- `POST /api/auth/login` — login
- `POST /api/auth/logout` — logout
- `GET /api/auth/me` — get current user
- `GET /api/users` — list all users (shows isFollowedByMe, followsMeBack)
- `GET /api/follows` — get my following/followers lists
- `POST /api/follows/:targetUserId` — follow a user
- `DELETE /api/follows/:targetUserId` — unfollow a user
- `GET /api/admin/users` — admin: full user list
- `PATCH /api/admin/users/:userId` — admin: edit user
- `DELETE /api/admin/users/:userId` — admin: delete user

### Admin Setup
After first registration, manually promote a user to admin via SQL:
`UPDATE users SET is_admin = true WHERE email = 'your@email.com';`

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references. This means:

- **Always typecheck from the root** — run `pnpm run typecheck`
- **`emitDeclarationOnly`** — we only emit `.d.ts` files during typecheck
- **Project references** — cross-package imports resolve correctly

## Packages

### `artifacts/api-server` (`@workspace/api-server`)

Express 5 API server. Routes live in `src/routes/`.

### `artifacts/tiktok-exchange` (`@workspace/tiktok-exchange`)

React + Vite frontend. Uses React Query for data fetching.

### `lib/db` (`@workspace/db`)

Database layer using Drizzle ORM with PostgreSQL.

Production migrations are handled by Replit when publishing. In development, use `pnpm --filter @workspace/db run push`.

### `lib/api-spec` (`@workspace/api-spec`)

Owns the OpenAPI 3.1 spec and Orval codegen config.

Run codegen: `pnpm --filter @workspace/api-spec run codegen`
