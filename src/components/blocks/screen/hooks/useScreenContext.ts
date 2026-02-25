import {useContext} from "react";
import ScreenContext, {type ScreenContextValue} from "../context/ScreenContext.tsx";

export default function useScreenContext(): ScreenContextValue {
    const context = useContext(ScreenContext);
    if (!context) {
        throw new Error('useScreenContext must be used within a ScreenProvider');
    }
    return context;
}
