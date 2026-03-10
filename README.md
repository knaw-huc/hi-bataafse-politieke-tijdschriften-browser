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

| Field | Type | Required | Description                                                                                                  |
|---|---|----------|--------------------------------------------------------------------------------------------------------------|
| `id` | `string` | yes      | Unique identifier                                                                                            |
| `label` | `string` | no       | Screen heading passed through `translateFn`; omit to use the autokey `screens.{id}`                          |
| `screenType` | `"normal"` | yes      | Screen layout variant (not used yet - intended for screen variants, eg., mobile, in a popover, confirmation) |
| `tabs` | `TabDefinition[]` | no       | Tab list; a tab bar is shown only when there are more than one                                               |
| `activeTabId` | `string` | no       | Initially active tab (defaults to first tab)                                                                 |
| `links` | `LinkDefinition[]` | no       | Navigation links rendered above the tabs                                                                     |
| `actions` | `ActionDefinition[]` | no       | Action buttons rendered in the footer                                                                        |
| `form` | `FormDefinition` | yes      | Content form (rows of elements)                                                                              |
| `sidebar` | `SidebarDefinition` | no       | Icon sidebar rendered to the left of the form                                                                |

#### TabDefinition (not used yet)

Tabs are .... tabs, and meant for executing an operation after clicking a tab.

| Field | Type | Required | Description                                                  |
|---|---|---|--------------------------------------------------------------|
| `id` | `string` | yes | Unique tab identifier                                        |
| `label` | `string` | no | Tab label; omit to use the autokey `screens.{screenId}.tabs.{tabId}` |
| `operation` | `OperationDefinition` | no | API operation to call when the tab is selected |
| `operationList` | `OperationListItem[]` | no | Sub-navigation items shown beneath the active tab            |

Each `OperationListItem` has an `id`, an optional `label` (autokey: `screens.{screenId}.tabs.{tabId}.{itemId}`), and an `operation`.

#### LinkDefinition (not used yet)

Links are intended to be 'follow-up' operations after fetching data. For example, we could envision the flow as follows:

- Fetch item data
- Link -> Fetch screen definition
- Link -> Fetch translations
- Link -> Fetch data from remote system

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | `string` | yes | Unique link identifier |
| `label` | `string` | yes | Link label |
| `operation` | `OperationDefinition` | no | API operation to execute on click |
| `href` | `string` | no | URL to navigate to on click |

#### ActionDefinition (not used yet)

Actions are meant to be simple API operations, executed after action button clicks.

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | `string` | yes | Unique action identifier |
| `label` | `string` | no | Button label; omit to use the autokey `screens.{screenId}.actions.{actionId}` |
| `activate` | `"always" \| "onDirty" \| "onValid" \| "onDirtyAndValid"` | yes | When the button is enabled |
| `confirmation` | `ConfirmationDefinition` | yes | Confirmation dialog settings |
| `operation` | `OperationDefinition` | yes | API operation to call on confirm |

**ConfirmationDefinition**

| Field | Type | Description |
|---|---|---|
| `askConfirmation` | `"always" \| "never" \| "onDirty"` | When to show a confirmation dialog |
| `labels.title` | `string` | Dialog title; omit to use the autokey `screens.{screenId}.actions.{actionId}.title` |
| `labels.message` | `string` | Dialog message; omit to use the autokey `screens.{screenId}.actions.{actionId}.message` |
| `labels.ok` | `string` | Confirm button label; omit to use the autokey `screens.{screenId}.actions.{actionId}.ok` |
| `labels.cancel` | `string` | Cancel button label; omit to use the autokey `screens.{screenId}.actions.{actionId}.cancel` |

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
| `label` | `string` | Optional fieldset legend; omit to use the autokey `screens.{screenId}.{groupId}` (requires `groupId`) |
| `groupId` | `string` | Used as the React key and `data-group-id` attribute |
| `elements` | `ElementDefinition[]` | Direct child elements (mutually exclusive with `columns`/`rows`) |
| `columns` | `ColumnDefinition[]` | Multi-column layout; each column holds its own elements |
| `rows` | `RowDefinition[]` | Nested rows (recursive) |

Row content is resolved in order of priority: nested `rows` → `columns` → `elements`.

#### ElementDefinition

| Field | Type | Description |
|---|---|---|
| `value` | `string \| string[] \| Record<string, string>` | Binding expression(s) — see [Bindings](#bindings) |
| `type` | `string` | Element type (see [Element types](#element-types)); inferred from data when omitted |
| `label` | `string` | Field label rendered above the element; omit to use the autokey `screens.{screenId}.{groupId}.{field}` (only available for single-string `value`) |
| `infoLabel` | `string` | Secondary info text rendered below the element; omit to use the autokey `screens.{screenId}.{groupId}.{field}.info` (only available for single-string `value`) |
| `hidden` | `boolean` | Hides the element when `true` |
| `config` | `object` | Type-specific configuration (e.g. `options` for `select`, `itemTemplate` for `array`) |

#### SidebarDefinition

| Field | Type | Description |
|---|---|---|
| `id` | `string` | Unique sidebar identifier |
| `width` | `string` | Optional CSS width for the sidebar (sets `--sidebar-width`) |
| `sections` | `SidebarSectionDefinition[]` | Groups of navigation items separated by a divider |

Each `SidebarNavItemDefinition` has an `icon` (Lucide icon name in kebab-case, e.g. `"book-open"`), an optional `label` (autokey: `screens.{screenId}.sidebar.{sectionId}.{itemId}`), an `operation`, and an optional `active` flag.

### Bindings

Element `value` fields and `itemTemplate` field values use binding expressions to pull data from the block's payload:

| Expression | Source |
|---|---|
| `$data#/field/subfield` | The `value` object of the `ScreenBlock` |
| `$itemData#/field` | The current item object when rendering inside an `array` element |

Path segments are separated by `/`.

The `value` field on an `ElementDefinition` supports three forms:

**Single string** — resolves to a single value and enables autokey label generation:
```jsonc
{ "value": "$data#/title", "type": "text" }
```

**Array of strings** — each binding is resolved independently; the block receives an array of resolved values. Useful for blocks that combine multiple data fields:
```jsonc
{ "value": ["$data#/firstName", "$data#/lastName"], "type": "full-name" }
```

**Object with string values** — each property's binding expression is resolved independently; the block receives a plain object with the resolved values. Useful for blocks that need named inputs (e.g. a map block needing separate latitude/longitude fields). No autokey is generated in this form:
```jsonc
{
  "value": {
    "latitude": "$data#/plaatsBreedtegraad",
    "longitude": "$data#/plaatsLengtegraad"
  },
  "type": "map",
  "config": { "zoom": 6 }
}
```

### Autokey label generation

All `label` (and `infoLabel`) fields are optional. When omitted, a translation key is derived automatically and passed through `translateFn`. The keys follow a hierarchical pattern based on the screen ID, group ID, and field path:

| Context | Autokey pattern | Example |
|---|---|---|
| Screen heading | `screens.{screenId}` | `screens.journal-detail` |
| Group legend | `screens.{screenId}.{groupId}` | `screens.journal-detail.metadata` |
| Element label | `screens.{screenId}.{groupId}.{field}` | `screens.journal-detail.metadata.title` |
| Element info label | `screens.{screenId}.{groupId}.{field}.info` | `screens.journal-detail.metadata.title.info` |
| Tab label | `screens.{screenId}.tabs.{tabId}` | `screens.journal-detail.tabs.general` |
| Tab operation list item | `screens.{screenId}.tabs.{tabId}.{itemId}` | `screens.journal-detail.tabs.general.volume-1` |
| Sidebar nav item | `screens.{screenId}.sidebar.{sectionId}.{itemId}` | `screens.journal-detail.sidebar.main.home` |
| Action button | `screens.{screenId}.actions.{actionId}` | `screens.journal-detail.actions.save` |
| Action confirmation title | `screens.{screenId}.actions.{actionId}.title` | `screens.journal-detail.actions.save.title` |
| Action confirmation message | `screens.{screenId}.actions.{actionId}.message` | `screens.journal-detail.actions.save.message` |
| Action confirmation ok | `screens.{screenId}.actions.{actionId}.ok` | `screens.journal-detail.actions.save.ok` |
| Action confirmation cancel | `screens.{screenId}.actions.{actionId}.cancel` | `screens.journal-detail.actions.save.cancel` |

The `{field}` segment is the path from the binding expression — e.g. `$data#/title` produces `title`, and `$data#/address/city` produces `address.city`.

When a `label` is provided explicitly it is used as-is (also passed through `translateFn`), which allows overriding the autokey with a custom translation key or a literal string.

### Element types

The element type can be an unspecified type, or a type present in the collection of
Panoptes-known blocks (list, cmdi) and/or application-specific custom blocks.

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

### Example of a full screen definition

```jsonc
{
  "id": "tijdschrift-detail",
  "screenType": "normal",
  "globals": {
  },
  "tabs": [
  ],
  "links": [
  ],
  "actions": [
  ],
  "sidebar": {
    "id": "tijdschrift-sidebar",
    "sections": [
      {
        "id": "main",
        "items": [
          {
            "id": "tijdschriften",
            "icon": "newspaper",
            "label": "tijdschrift-detail.tijdschrift-sidebar.label.publications"
          }
        ]
      },
      {
        "id": "util",
        "items": [
          {
            "id": "instellingen",
            "icon": "settings",
            "label": "tijdschrift-detail.tijdschrift-sidebar.label.settings"
          }
        ]
      }
    ]
  },
  "form": {
    "rows": [
      {
        "displayType": "group",
        "groupId": "titel",
        "columns": [
          {
            "elements": [
              {
                "value": "$data#/lidwoordTitel",
                "type": "label"
              }
            ]
          },
          {
            "elements": [
              {
                "value": "$data#/titelVanTijdschrift",
                "type": "label"
              }
            ]
          },
          {
            "elements": [
              {
                "value": "$data#/onderTitel",
                "type": "label"
              }
            ]
          }
        ]
      },
      {
        "displayType": "group",
        "groupId": "publicatie",
        "rows": [
          {
            "columns": [
              {
                "elements": [
                  {
                    "value": "$data#/uitgever",
                    "type": "link",
                    "config": {
                      "url": "/politieke-tijdschriften-uitgever_drukker/details/$uitgeverId"
                    }
                  }
                ]
              },
              {
                "elements": [
                  {
                    "value": "$data#/drukker",
                    "type": "link",
                    "config": {
                      "url": "/politieke-tijdschriften-uitgever_drukker/details/$drukkerId"
                    }
                  }
                ]
              },
              {
                "elements": [
                  {
                    "value": "$data#/plaats",
                    "type": "link",
                    "config": {
                      "url": "/politieke-tijdschriften-plaatsnaam/details/$plaatsId"
                    }
                  }
                ]
              }
            ]
          },
          {
            "columns": [
              {
                "elements": [
                  {
                    "value": "$data#/uitgeverZeker",
                    "type": "toggle"
                  }
                ]
              },
              {
                "elements": [
                  {
                    "value": "$data#/drukkerZeker",
                    "type": "toggle"
                  }
                ]
              },
              {
                "elements": [
                  {
                    "value": "$data#/nietBewaard",
                    "type": "toggle"
                  }
                ]
              },
              {
                "elements": [
                  {
                    "value": "$data#/vrijheidGelijkheidBroederschap",
                    "type": "toggle"
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        "displayType": "group",
        "groupId": "periode",
        "rows": [
          {
            "columns": [
              {
                "elements": [
                  {
                    "value": "$data#/eersteNummer",
                    "type": "label"
                  }
                ]
              },
              {
                "elements": [
                  {
                    "value": "$data#/laatsteNummer",
                    "type": "label"
                  }
                ]
              },
              {
                "elements": [
                  {
                    "value": "$data#/prijsDuiten",
                    "type": "label"
                  }
                ]
              },
              {
                "elements": [
                  {
                    "value": "$data#/afleveringen",
                    "type": "label"
                  }
                ]
              }
            ]
          },
          {
            "elements": [
              {
                "value": "$data#/formaat",
                "type": "label"
              }
            ]
          }
        ]
      },
      {
        "displayType": "group",
        "groupId": "classificatie",
        "columns": [
          {
            "elements": [
              {
                "value": "$data#/vormTijdschrift",
                "type": "label"
              }
            ]
          },
          {
            "elements": [
              {
                "value": "$data#/typeTijdschrift",
                "type": "label"
              }
            ]
          },
          {
            "elements": [
              {
                "value": "$data#/politiekePositie",
                "type": "label"
              }
            ]
          }
        ]
      },
      {
        "displayType": "group",
        "groupId": "inhoud",
        "elements": [
          {
            "value": "$data#/korteOmschrijvingInhoud",
            "type": "markdown",
            "config": {
            }
          },
          {
            "value": "$data#/verantwoordingSelectie",
            "type": "markdown",
            "config": {
            }
          },
          {
            "value": "$data#/toelichtingRedacteurAuteur",
            "type": "markdown",
            "config": {
            }
          },
          {
            "value": "$data#/advertenties_en_andere_verwijsplaatsen",
            "type": "markdown"
          }
        ]
      },
      {
        "displayType": "group",
        "groupId": "aanvullende-titels",
        "elements": [
          {
            "value": "$data#/aanvullendeTitels",
            "type": "list"
          }
        ]
      },
      {
        "displayType": "group",
        "groupId": "artikel-types",
        "elements": [
          {
            "value": "$data#/artikelType",
            "type": "list"
          }
        ]
      }
    ]
  }
}
```
