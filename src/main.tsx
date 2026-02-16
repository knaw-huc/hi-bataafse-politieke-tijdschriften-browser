import {createPanoptesRoot, PanoptesRouterProvider} from '@knaw-huc/panoptes-react';
import '@knaw-huc/panoptes-react/style.css';
import './css/politieke-tijdschriften.css';
import "./i18n/i18n.ts";
import {createTranslate} from "./i18n/i18n.ts";
import RenderLink from "./components/blocks/link";
import RenderMarkdown from "./components/blocks/markdown";
import JsonBlockRenderer from "./components/blocks/json/JsonBlockRenderer.tsx";

const panoptesUrl = '$VITE_PANOPTES_URL';
const panoptesIsEmbedded = '$VITE_PANOPTES_IS_EMBEDDED';
const panoptesSearchPath = '$VITE_PANOPTES_SEARCH_PATH';
const panoptesDetailPath = '$VITE_PANOPTES_DETAIL_PATH';
const panoptesDataset = '$VITE_PANOPTES_DATASET';

const getVar = (envVariable: string): string | undefined =>
    envVariable.startsWith('$VITE_')
        ? (envVariable.slice(1) in import.meta.env ? import.meta.env[envVariable.slice(1)] : undefined)
        : envVariable;

const root = createPanoptesRoot(document.getElementById('root')!, {
    url: getVar(panoptesUrl),
    isEmbedded: getVar(panoptesIsEmbedded) === 'true',
    searchPath: getVar(panoptesSearchPath),
    detailPath: getVar(panoptesDetailPath),
    dataset: getVar(panoptesDataset),
    translateFn: createTranslate(),
    blocks: new Map([
        ["json", JsonBlockRenderer],
        ["link", RenderLink],
        ["markdown", RenderMarkdown],
    ])
});
root.render(<PanoptesRouterProvider/>);