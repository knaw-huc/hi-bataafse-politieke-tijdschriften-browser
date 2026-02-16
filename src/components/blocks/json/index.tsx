import type {Block} from "@knaw-huc/panoptes-react";
import JsonBlockRenderer from "./JsonBlockRenderer.tsx";

export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonObject | JsonArray;
export type JsonObject = { [key: string]: JsonValue };
export type JsonArray = JsonValue[];
export type JsonData = JsonValue;
export type JsonSchema = JsonObject;

export interface JsonBlock extends Block {
    type: "json";
    value: JsonData;
    config: JsonSchema;
}

const RenderJsonBlock = ({ block }: { block: Block }) => {
    return (<JsonBlockRenderer block={block as JsonBlock} />);
};

export default RenderJsonBlock;
