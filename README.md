# Bataafse Politieke Tijdschriften Browser

A web application for browsing and exploring Dutch historical political journals (Bataafse Politieke Tijdschriften). Built with React and the [KNAW-HUC Panoptes](https://github.com/knaw-huc/panoptes) framework for digital collection browsing.

## Tech Stack

- **React 19** with TypeScript
- **Vite 7** (build tool and dev server)
- **Tailwind CSS v4** (styling)
- **@knaw-huc/faceted-search-react** (faceted search components)
- **knaw-huc/panoptes** ()
- **@knaw-huc/panoptes-react** (digital collection browser framework)
- **react-markdown** with rehype plugins (markdown content rendering)

## Prerequisites

- Node.js (with npm)
- A running [Panoptes](https://github.com/knaw-huc/panoptes) backend service (defaults to `http://localhost:8000`)

## Getting Started

### Install dependencies

```bash
npm install
```

### Configure environment

Copy or edit the `.env` file to point to your Panoptes backend:

```env
VITE_PANOPTES_URL=http://localhost:8000
VITE_PANOPTES_IS_EMBEDDED=false
VITE_PANOPTES_DATASET=politieke-tijdschriften
VITE_PANOPTES_SEARCH_PATH=/$dataset/search
VITE_PANOPTES_DETAIL_PATH=/$dataset/details/$id
```

| Variable | Description |
|---|---|
| `VITE_PANOPTES_URL` | Base URL of the Panoptes backend service |
| `VITE_PANOPTES_IS_EMBEDDED` | Set to `true` when embedding the app in an iframe |
| `VITE_PANOPTES_DATASET` | Dataset identifier used in API paths |
| `VITE_PANOPTES_SEARCH_PATH` | Search endpoint path template (`$dataset` is replaced at runtime) |
| `VITE_PANOPTES_DETAIL_PATH` | Detail endpoint path template (`$dataset` and `$id` are replaced at runtime) |

### Run the development server

```bash
npm run dev
```

### Build for production

```bash
npm run build
```

### Preview the production build

```bash
npm run preview
```

### Lint

```bash
npm run lint
```

## Project Structure

```
src/
  main.tsx          # Application entry point and Panoptes configuration
public/             # Static assets
index.html          # HTML template
.env                # Environment configuration
vite.config.ts      # Vite build configuration
tsconfig.json       # TypeScript configuration
eslint.config.js    # ESLint configuration
```
