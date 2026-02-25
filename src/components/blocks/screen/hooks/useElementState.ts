import type {ElementDefinition} from "../schema";
import useScreenState from "./useScreenState.ts";
import {getNestedValue, isBindingExpression, parseBinding} from "../schema";
import {useItemData} from "./useItemData.ts";
import useScreenContext from "./useScreenContext.ts";

function buildLabelKey(screenId: string, groupId: string | undefined, path: string[]): string {
    const parts = ['screens', screenId];
    if (groupId) parts.push(groupId);
    parts.push(...path);
    return parts.join('.');
}

export default function useElementState(element: ElementDefinition, groupId?: string) {
    const { getValue } = useScreenState();
    const itemData = useItemData();
    const { screenDefinition } = useScreenContext();

    const resolveValue = (expression: string): unknown => {
        const parsed = parseBinding(expression);
        if (parsed.source === 'itemData') {
            return getNestedValue(itemData, parsed.path);
        }
        return getValue(expression);
    };

    const autoLabelKey = isBindingExpression(element.value)
        ? buildLabelKey(screenDefinition.id, groupId, parseBinding(element.value).path)
        : undefined;

    return {
        value: resolveValue(element.value),
        hidden: element.hidden ?? false,
        label: element.label ?? autoLabelKey,
        infoLabel: element.infoLabel ?? (autoLabelKey ? `${autoLabelKey}.info` : undefined),
        config: element.config,
    };
}
