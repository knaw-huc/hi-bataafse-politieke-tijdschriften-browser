import {useRouter} from "@tanstack/react-router";
import type {Block} from "@knaw-huc/panoptes-react";
import classes from "./SearchLinkBlockRenderer.module.css";

export interface SearchLinkBlockConfig {
    url: string;
}

export interface SearchLinkBlock extends Block {
    type: 'search-link';
    value: string;
    config?: SearchLinkBlockConfig;
    model?: Record<string, unknown>;
}

export default function SearchLinkBlockRenderer({block}: { block: Block }) {

    const router = useRouter();
    const { value, config, model } = block as SearchLinkBlock;

    if (!value || !config || !config.url) {
        return <span className={classes.empty}>—</span>;
    }

    const [path, query = ''] = config.url.split('?');
    const search = Object.fromEntries(
        [...new URLSearchParams(query)].map(([key, val]) =>
            [key, val.startsWith('$') ? model?.[val.slice(1)] : val])
    );
    const link = router.buildLocation({ to: path, params: model, search }).href
    return (
        <a className={classes.link} href={link}>{value}</a>
    );

}
