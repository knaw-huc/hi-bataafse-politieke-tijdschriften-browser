import {useContext} from "react";
import ItemDataContext from "../context/ItemDataContext.tsx";

export function useItemData(): Record<string, unknown> | null {
    return useContext(ItemDataContext);
}
