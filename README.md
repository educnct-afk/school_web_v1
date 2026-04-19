# school_web

React front-end for the school management platform. Talks to `school_server` (Spring Boot, port 9090).

## Setup

```bash
cd school_web
npm install
npm run dev        # http://localhost:5173
```

Copy `.env.example` to `.env` and adjust as needed before starting.

## Default SUPER_ADMIN credentials

| Field    | Value                    |
|----------|--------------------------|
| Email    | `superadmin@system.local` |
| Password | `ChangeMe!2026`           |

> These are seeded by `BootstrapSeeder` on first boot. Change them immediately in production.

## Server: first-boot note

`school_server/src/main/resources/application.properties` has:

```
app.db.fresh-start=true
```

This **drops all tables** on every startup. Flip to `false` after the first successful boot to preserve data.

## Architecture

### MVVM

```
UI (*.jsx)  ←→  ViewModel (use*ViewModel.js)  ←→  Service (*.js)  ←→  API
```

- **Service** — pure async functions, no React dependency.
- **ViewModel** — React hook; owns loading/error state, calls service, exposes data + actions to the view.
- **UI** — renders ViewModel output, fires ViewModel actions. No direct API calls.

Future React Native migration: swap the UI layer only; ViewModels and Services are reused as-is.

### Module layout

```
src/
  core/               # shared infrastructure (not a feature module)
    api/              # axios client, request/response wrappers
    auth/             # hasPermission wildcard matcher
    features/         # two-tier feature flag helpers
    router/           # AppRouter, ProtectedRoute, PublicRoute
    stores/           # Zustand auth store (persisted to localStorage)
    ui/               # primitive components, layouts, shared pages
  modules/
    auth/             # login, password reset, sessions
    iam/              # users, roles, permissions, organizations, audit log, profile
```

Each module is **independently replaceable** — it owns its services, viewmodels, UI pages, and route declaration. `AppRouter` imports only the route fragment from each module; it has no knowledge of the module internals.

### Permission-based RBAC

Permissions follow the pattern `module:resource:action` (e.g. `iam:users:read`).  
Roles are arbitrary labels for permission sets — the client never branches on role names.  
`hasPermission` / `hasAny` in `src/core/auth/hasPermission.js` mirror the server's wildcard logic:

- `*:*:*` — super-admin wildcard
- `iam:*:*` — full module access
- `iam:users:*` — full resource access

## Feature flags

### Module flags (`.env`)

| Variable           | Default | Effect                      |
|--------------------|---------|-----------------------------|
| `VITE_MODULE_AUTH` | `true`  | Enable/disable AUTH module  |
| `VITE_MODULE_IAM`  | `true`  | Enable/disable IAM module   |

### Feature flags

Format: `VITE_<MODULE>_<FEATURE>` — a feature is on only when **both** its module flag and its own flag are truthy. Missing = `true`.

| Variable                      | Module | Feature          |
|-------------------------------|--------|------------------|
| `VITE_AUTH_LOGIN`             | AUTH   | Login page       |
| `VITE_AUTH_PASSWORD_RESET`    | AUTH   | Password reset   |
| `VITE_AUTH_SESSIONS`          | AUTH   | Session manager  |
| `VITE_IAM_USERS`              | IAM    | Users CRUD       |
| `VITE_IAM_ROLES`              | IAM    | Roles CRUD       |
| `VITE_IAM_PERMISSIONS`        | IAM    | Permissions CRUD |
| `VITE_IAM_ORGANIZATIONS`      | IAM    | Orgs CRUD        |
| `VITE_IAM_AUDIT_LOG`          | IAM    | Audit log viewer |
| `VITE_IAM_PROFILE`            | IAM    | User profile     |

## API base URL

Set `VITE_API_BASE_URL` in `.env` (defaults to `http://localhost:9090`).
