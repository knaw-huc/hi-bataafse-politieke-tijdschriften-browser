import type {Block} from "@knaw-huc/panoptes-react";
import classes from "../Blocks.module.css";

export interface ExternalLinkBlock extends Block {
    type: 'link';
    value: string;
}

export default function ExternalLinkBlockRenderer({block}: { block: Block }) {

    const { value } = block as ExternalLinkBlock;

    if (!value) {
        return <span className={classes.empty}>—</span>;
    }

    return (
        <a className={classes.link} href={value} target='_blank noreferrer noopener'>{value}</a>
    );

}


