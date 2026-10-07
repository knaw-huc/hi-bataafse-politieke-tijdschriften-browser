import type {Block} from "@knaw-huc/panoptes-react";
import CountedPropertyList, {type CountedPropertyListData} from "./CountedPropertyList.tsx";

export interface CountedPropertyListBlock extends Block {
    type: 'counted-list';
    value: CountedPropertyListData;
}

export default function CountedPropertyListRenderer({block}: { block: Block }) {
    const { value } = block as CountedPropertyListBlock;

    return (
        <CountedPropertyList data={value}/>
    );
}
