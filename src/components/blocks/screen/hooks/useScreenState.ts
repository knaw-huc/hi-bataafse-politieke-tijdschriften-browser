
import { useCallback } from 'react';
import { getNestedValue, parseBinding } from '../schema';
import {useScreenContext} from "../hooks";

export default function useScreenState() {
    const { data } = useScreenContext();

    const getValue = useCallback((expression: string): unknown => {
        const { path } = parseBinding(expression);
        return getNestedValue(data, path);
    }, [data]);

    return { getValue };
}
