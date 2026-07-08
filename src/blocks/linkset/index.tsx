import type {Block} from "@knaw-huc/panoptes-react";
import classes from "./LinkSetBlockRenderer.module.css";

export interface LinkSetBlock extends Block {
    type: 'link-set';
    value: string | string[];
}

export default function LinkSetBlockRenderer({block}: { block: Block }) {

    const { value } = block as LinkSetBlock;

    if (!value || !Array.isArray(value) || value.length === 0) {
        return <span className={classes.empty}>—</span>;
    }

    if (Array.isArray(value)) {
        return (
            <ul className={classes.linkset}>
                {value.map((item) => {
                    if (!item) {
                        return (<li><span className={classes.empty}>—</span></li>);
                    }
                    return (<li><a className={classes.link} href={item} target='_blank' rel='noreferrer'>{item}</a></li>);
                })}
            </ul>
        );
    }

    return (<a className={classes.link} href={value} target='_blank' rel='noreferrer'>{value}</a>);
}
