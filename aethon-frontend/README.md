# AETHON AI Frontend

## Deploy to Vercel

Import `aethon-frontend` as the Vercel project. The repository includes the Vite build settings in `vercel.json`, so Vercel will run `npm ci`, build with `npm run build`, and serve `dist`.

Add these variables in Vercel under **Settings -> Environment Variables** for Preview and Production:

```text
VITE_USE_MOCK=false
VITE_API_BASE_URL=https://aethon-ai-smms.onrender.com/api
VITE_SOCKET_URL=https://aethon-ai-smms.onrender.com
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_MAPBOX_TOKEN=your-mapbox-public-token
```

The `/api/*` rewrite falls back to the Render backend when `VITE_API_BASE_URL` is not set. Keep the Supabase and Mapbox values in Vercel only; do not commit them.

For local setup, copy `.env.example` to `.env`, fill in the values, and run:

```bash
npm install
npm run dev
```

## Development

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.
