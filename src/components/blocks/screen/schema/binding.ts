export interface ParsedBinding {
    source: 'data' | 'itemData';
    path: string[];
    rawPath: string;
}

const BINDING_REGEX = /^\$data#\/(.+)$/;
const ITEM_BINDING_REGEX = /^\$itemData#\/(.+)$/;

export function isBindingExpression(value: string): boolean {
    return BINDING_REGEX.test(value) || ITEM_BINDING_REGEX.test(value);
}

export function parseBinding(expression: string): ParsedBinding {
    const dataMatch = expression.match(BINDING_REGEX);
    if (dataMatch) {
        const rawPath = dataMatch[1];
        return { source: 'data', path: rawPath.split('/'), rawPath };
    }

    const itemMatch = expression.match(ITEM_BINDING_REGEX);
    if (itemMatch) {
        const rawPath = itemMatch[1];
        return { source: 'itemData', path: rawPath.split('/'), rawPath };
    }

    throw new Error(`Invalid binding expression: ${expression}. Expected format: $data#/path or $itemData#/path`);
}

export function getNestedValue(obj: unknown, path: string[]): unknown {
    let current: unknown = obj;

    for (const key of path) {
        if (current === null || current === undefined) {
            return undefined;
        }
        if (typeof current !== 'object') {
            return undefined;
        }
        current = (current as Record<string, unknown>)[key];
    }

    return current;
}
