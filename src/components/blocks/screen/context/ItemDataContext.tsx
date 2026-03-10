import {createContext, type ReactNode} from 'react';

const ItemDataContext = createContext<Record<string, unknown> | null>(null);

export function ItemDataProvider({ item, children }: { item: Record<string, unknown>; children: ReactNode }) {
    return (
        <ItemDataContext.Provider value={item}>
            {children}
        </ItemDataContext.Provider>
    );
}

export default ItemDataContext;
