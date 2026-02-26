import {useRouter} from "@tanstack/react-router";
import type {Block} from "@knaw-huc/panoptes-react";
import classes from "../Blocks.module.css";

export interface LinkBlockConfig {
    url: string;
}

export interface LinkBlock extends Block {
    type: 'link';
    value: string;
    config?: LinkBlockConfig;
    model?: Record<string, unknown>;
}

export default function LinkBlockRenderer({block}: { block: Block }) {

    const router = useRouter();
    const { value, config, model } = block as LinkBlock;

    if (!value || !config || !config.url) {
        return <span className={classes.empty}>—</span>;
    }

    const link = router.buildLocation({ to: config.url, params: model }).href
    return (
        <a className={classes.link} href={link}>{value}</a>
    );

}


