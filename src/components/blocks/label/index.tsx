import type {Block} from "@knaw-huc/panoptes-react";
import classes from "../Blocks.module.css";

export interface LabelBlock extends Block {
    type: 'label';
    value: string;
}

export default function LinkBlockRenderer({block}: { block: Block }) {

    const { value } = block as LabelBlock;

    if (!value) {
        return <span className={classes.empty}>—</span>;
    }

    return (<span>{value}</span>);

}


