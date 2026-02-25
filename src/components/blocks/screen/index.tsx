import ScreenRenderer from './ScreenRenderer';
import type {ScreenBlock} from "./schema";
import {ScreenProvider} from "./context/ScreenContext.tsx";
import type {Block} from "@knaw-huc/panoptes-react";

interface RenderScreenBlockProps {
    block: Block;
}

const RenderScreenBlock = ({ block }: RenderScreenBlockProps) => {
    return (
            <ScreenProvider screenDefinition={(block as ScreenBlock).config}
                            data={(block as ScreenBlock).value}>
                <ScreenRenderer />
            </ScreenProvider>
    );
};

export default RenderScreenBlock;
