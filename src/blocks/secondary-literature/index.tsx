import type {Block} from "@knaw-huc/panoptes-react";
import {MarkdownBlockRenderer} from "@knaw-huc/panoptes-react-blocks";
import classes from "./SecondaryLiteratureRenderer.module.css";

export interface MarkdownListBlock extends Block {
    type: 'secondary-literature';
    value: string | string[];
}

export default function SecondaryLiteratureRenderer({block}: { block: Block }) {

    const {value} = block as MarkdownListBlock;

    if (!value || !Array.isArray(value) || value.length === 0) {
        return <span className={classes.empty}>—</span>;
    }

    if (Array.isArray(value)) {
        return (
            <ul className={classes.list}>
                {value.map((item, index) => (
                    <li className={classes.item} key={index}>
                        <MarkdownBlockRenderer block={{type: 'markdown', value: item}}/>
                    </li>
                ))}
            </ul>
        );
    }

    return <MarkdownBlockRenderer block={{type: 'markdown', value}}/>;
}
