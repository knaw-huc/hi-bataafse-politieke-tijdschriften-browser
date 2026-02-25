import {type Block, usePanoptes} from "@knaw-huc/panoptes-react";
import {CheckIcon, XMarkIcon} from "@heroicons/react/24/solid";
import classes from "../Blocks.module.css";

export interface ToggleBlock extends Block {
    type: 'toggle';
    value: boolean;
}

export default function ToggleBlockRenderer({block}: {block: Block}) {
    const { value } = block as ToggleBlock;
    const { translateFn } = usePanoptes();

    if (value === null || value === undefined) {
        return <span className={classes.empty}>—</span>;
    }

    return (
        <span>
            {value ? <CheckIcon width={16} height={16} title={translateFn ? translateFn('panoptes.yes') : 'Yes'}/>
                        : <XMarkIcon width={16} height={16} title={translateFn ? translateFn('panoptes.no') : 'No'} />}
        </span>
    );

}


