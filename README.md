# Bataafse Politieke Tijdschriften Browser

A web application for browsing and exploring Dutch historical political journals (Bataafse Politieke Tijdschriften). Built with React and the [KNAW-HUC Panoptes](https://github.com/knaw-huc/panoptes) framework for digital collection browsing.

## Tech Stack

- **React 19** with TypeScript
- **Vite 7** (build tool and dev server)
- **Tailwind CSS v4** (styling)
- **React-Markdown** with rehype plugins (markdown content rendering, https://remarkjs.github.io/react-markdown/)
- **@knaw-huc/faceted-search-react** (faceted search components, https://github.com/knaw-huc/faceted-search-react)
- **@knaw-huc/panoptes-react** (digital collection browser framework, https://github.com/knaw-huc/panoptes-react)
- **Panoptes-API** (https://github.com/knaw-huc/panoptes)

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

## Screen Blocks

The screen block system (`src/components/blocks/screen/`) renders structured detail screens driven by a declarative JSON configuration from the Panoptes API. A screen block is registered as a Panoptes block of type `"screen"` and can be used anywhere the framework renders blocks.

### Architecture overview

```
RenderScreenBlock          # Registered Panoptes block component
└── ScreenProvider         # React context (screenDefinition + data + active tab)
    └── ScreenRenderer     # Top-level layout shell
        ├── ScreenLinks    # Optional navigation links (header area)
        ├── ScreenTabs     # Optional tab bar (hidden when only one tab)
        ├── ScreenSidebar  # Optional icon sidebar (Lucide icons)
        ├── ScreenForm     # Form body
        │   └── FormRow    # Recursive row rendering (header / group / footer / row)
        │       └── FormColumn → FormElement   # Column + element rendering
        └── ScreenActions  # Optional action buttons with confirmation dialogs
```

### ScreenBlock config schema

A `ScreenBlock` received from the API has the following shape:

```jsonc
{
  "type": "screen",
  "value": { /* flat or nested data object */ },
  "config": { /* ScreenDefinition — see below */ }
}
```

#### ScreenDefinition

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | `string` | yes | Unique identifier |
| `label` | `string` | yes | Screen heading (passed through `translateFn`) |
| `screenType` | `"normal"` | yes | Screen layout variant |
| `tabs` | `TabDefinition[]` | yes | Tab list; a tab bar is shown only when there are more than one |
| `activeTabId` | `string` | no | Initially active tab (defaults to first tab) |
| `links` | `LinkDefinition[]` | no | Navigation links rendered above the tabs |
| `actions` | `ActionDefinition[]` | no | Action buttons rendered in the footer |
| `form` | `FormDefinition` | yes | Content form (rows of elements) |
| `sidebar` | `SidebarDefinition` | no | Icon sidebar rendered to the left of the form |

#### TabDefinition

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | `string` | yes | Unique tab identifier |
| `label` | `string` | yes | Tab label |
| `operation` | `OperationDefinition` | no | API operation to call when the tab is selected |
| `operationList` | `OperationListItem[]` | no | Sub-navigation items shown beneath the active tab |

#### LinkDefinition

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | `string` | yes | Unique link identifier |
| `label` | `string` | yes | Link label |
| `operation` | `OperationDefinition` | no | API operation to execute on click |
| `href` | `string` | no | URL to navigate to on click |

#### ActionDefinition

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | `string` | yes | Unique action identifier |
| `label` | `string` | yes | Button label |
| `activate` | `"always" \| "onDirty" \| "onValid" \| "onDirtyAndValid"` | yes | When the button is enabled |
| `confirmation` | `ConfirmationDefinition` | yes | Confirmation dialog settings |
| `operation` | `OperationDefinition` | yes | API operation to call on confirm |

**ConfirmationDefinition**

| Field | Type | Description |
|---|---|---|
| `askConfirmation` | `"always" \| "never" \| "onDirty"` | When to show a confirmation dialog |
| `labels.title` | `string` | Dialog title |
| `labels.message` | `string` | Dialog message |
| `labels.ok` | `string` | Confirm button label (default: `"OK"`) |
| `labels.cancel` | `string` | Cancel button label (default: `"Cancel"`) |

#### FormDefinition and rows

```jsonc
{
  "form": {
    "rows": [ /* RowDefinition[] */ ]
  }
}
```

**RowDefinition**

| Field | Type | Description |
|---|---|---|
| `displayType` | `"header" \| "group" \| "footer" \| "row"` | Styling variant (default: `"row"`) |
| `label` | `string` | Optional fieldset legend |
| `groupId` | `string` | Used as the React key and `data-group-id` attribute |
| `elements` | `ElementDefinition[]` | Direct child elements (mutually exclusive with `columns`/`rows`) |
| `columns` | `ColumnDefinition[]` | Multi-column layout; each column holds its own elements |
| `rows` | `RowDefinition[]` | Nested rows (recursive) |

Row content is resolved in order of priority: nested `rows` → `columns` → `elements`.

#### ElementDefinition

| Field | Type | Description |
|---|---|---|
| `value` | `string` | Binding expression (see [Bindings](#bindings)) |
| `type` | `string` | Element type (see [Element types](#element-types)); inferred from data when omitted |
| `label` | `string` | Field label rendered above the element |
| `infoLabel` | `string` | Secondary info text rendered below the element |
| `hidden` | `boolean` | Hides the element when `true` |
| `config` | `object` | Type-specific configuration (e.g. `options` for `select`, `itemTemplate` for `array`) |

#### SidebarDefinition

| Field | Type | Description |
|---|---|---|
| `id` | `string` | Unique sidebar identifier |
| `width` | `string` | Optional CSS width for the sidebar (sets `--sidebar-width`) |
| `sections` | `SidebarSectionDefinition[]` | Groups of navigation items separated by a divider |

Each `SidebarNavItemDefinition` has an `icon` (Lucide icon name in kebab-case, e.g. `"book-open"`), a `label`, an `operation`, and an optional `active` flag.

### Bindings

Element `value` fields and `itemTemplate` field values use binding expressions to pull data from the block's payload:

| Expression | Source |
|---|---|
| `$data#/field/subfield` | The `value` object of the `ScreenBlock` |
| `$itemData#/field` | The current item object when rendering inside an `array` element |

Path segments are separated by `/`.

### Element types

When `type` is not specified on an `ElementDefinition` the type is inferred from the resolved value:

| Inferred condition | Type |
|---|---|
| Array | `array` |
| Boolean | `checkbox` |
| Number | `number` |
| String matching `YYYY-MM-DD…` | `date` |
| String containing `\n` | `textarea` |
| Anything else | `text` |

Explicit types available:

| Type | Rendered as | Config options |
|---|---|---|
| `text` | `<input type="text">` (read-only) | — |
| `textarea` | `<textarea>` (read-only) | — |
| `number` | `<input type="number">` (read-only) | — |
| `date` | `<input type="date">` (read-only) | — |
| `checkbox` | `<input type="checkbox">` (read-only) | — |
| `prose` | Inline `<span>` | — |
| `select` | Resolved option label in `<input type="text">` | `config.options: { value, label }[]` |
| `array` | List of text inputs, or templated item rows | `config.itemTemplate`: map of field name → `ElementDefinition` |

Any `type` that matches a registered Panoptes block is rendered using that block component. If no matching block is found (or the block component throws), the element falls back to the native HTML renderer above.

### Example

```jsonc
{
  "type": "screen",
  "value": {
    "title": "De Politieke Blixem",
    "year": 1801,
    "tags": ["satire", "politics"]
  },
  "config": {
    "id": "journal-detail",
    "label": "Journal",
    "screenType": "normal",
    "tabs": [{ "id": "main", "label": "Details" }],
    "actions": [],
    "form": {
      "rows": [
        {
          "displayType": "group",
          "label": "Metadata",
          "elements": [
            { "value": "$data#/title", "label": "Title" },
            { "value": "$data#/year",  "label": "Year" },
            { "value": "$data#/tags",  "label": "Tags", "type": "array" }
          ]
        }
      ]
    }
  }
}
```
