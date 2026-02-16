import {useRouter} from "@tanstack/react-router";
import type {Block} from "@knaw-huc/panoptes-react";
import classes from "./Link.module.css";

export interface LinkBlock extends Block {
    type: 'link';
    url: string;
    model?: Record<string, unknown>;
}

export default function LinkBlockRenderer({block}: { block: Block }) {

    const router = useRouter();
    const { value, url, model } = block as LinkBlock;

    if (!value || !url) {
        return <span className={classes.empty}>—</span>;
    }

    const link = router.buildLocation({ to: url, params: model }).href

    return (
        <a className={classes.link} href={link}>
            {typeof value === "string" ? value : String(value)}
        </a>
    );

}


