# Bataafse Politieke Tijdschriften Browser (Panoptes)

A web front-end for browsing the **Bataafse Politieke Tijdschriften** dataset of Dutch
historical political journals, built on the
[KNAW-HuC Panoptes](https://github.com/knaw-huc) faceted-search framework. It provides
faceted search over the publications with a custom result card and detail views, and
supports English/Dutch localization.

## Tech stack

- [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vite.dev/) for dev server and bundling
- [`@knaw-huc/panoptes-react`](https://www.npmjs.com/package/@knaw-huc/panoptes-react) and
  [`@knaw-huc/panoptes-react-blocks`](https://www.npmjs.com/package/@knaw-huc/panoptes-react-blocks) for the search UI
- [i18next](https://www.i18next.com/) for English/Dutch localization

## Getting started

Requires [Node.js](https://nodejs.org/) (with npm) and a running Panoptes backend serving
the `politieke-tijdschriften` dataset.

```bash
npm install
cp .env.example .env   # then edit values as needed
npm run dev
```

The dev server prints a local URL (default <http://localhost:5173>).

## Configuration

The app reads its Panoptes connection settings from environment variables. Vite injects
these into `import.meta.env` at dev/build time; adjust the values in `.env` (or `.env.local`):

| Variable                     | Description                                              | Example                                |
| ---------------------------- | -------------------------------------------------------- | -------------------------------------- |
| `VITE_PANOPTES_URL`          | Base URL of the Panoptes backend API                     | `http://localhost:8000`                |
| `VITE_PANOPTES_IS_EMBEDDED`  | Whether the UI runs embedded (no top-level chrome)       | `false`                                |
| `VITE_PANOPTES_DATASET`      | Dataset identifier to query                              | `politieke-tijdschriften`              |
| `VITE_PANOPTES_SEARCH_PATH`  | Search route template (`$dataset` is substituted)        | `/$dataset/search`                     |
| `VITE_PANOPTES_DETAIL_PATH`  | Detail route template (`$dataset`, `$id` substituted)    | `/$dataset/details/$id`                |
| `VITE_PANOPTES_THEME`        | Panoptes UI theme                                        | `huygens`                              |

In Docker (production/staging) the variables are injected at container startup:
`conf/entrypoint.sh` runs `envsubst` over the built JS files, replacing the literal
`$VITE_*` placeholders with the container environment values before Nginx starts serving.
No `.env` file is needed in the image — configure the variables in your orchestrator.

## Scripts

| Command           | Description                                    |
| ----------------- | ---------------------------------------------- |
| `npm run dev`     | Start the Vite dev server with HMR             |
| `npm run build`   | Type-check (`tsc -b`) and build for production |
| `npm run preview` | Preview the production build locally           |
| `npm run lint`    | Run ESLint                                     |

## Project structure

```
src/
  main.tsx              App entry; configures the Panoptes root, routes, and result card
  components/results/   PublicationResultsCard — custom search result card
  i18n/                 i18next setup and en/nl translations
  css/                  Theme and global styles
public/
  vite.svg
conf/
  entrypoint.sh         Docker entrypoint: runs envsubst over built JS, then starts Nginx
  nginx.conf            Nginx configuration
Dockerfile              Container image build
```

## Localization

The interface auto-detects the browser language and supports English (`en`) and
Dutch (`nl`), falling back to English. Translation strings live in
`src/i18n/locales/<lang>/common.json`.
</content>
</invoke>
