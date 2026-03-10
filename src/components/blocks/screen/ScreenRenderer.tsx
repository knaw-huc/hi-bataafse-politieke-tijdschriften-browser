import React from 'react';
import ScreenTabs from './ScreenTabs';
import ScreenForm from './ScreenForm';
import ScreenActions from './ScreenActions';
import ScreenLinks from './ScreenLinks';
import ScreenSidebar from './ScreenSidebar';
import {useScreenContext} from "./hooks";
import {usePanoptes} from "@knaw-huc/panoptes-react";
import styles from './ScreenRenderer.module.css';

export default function ScreenRenderer() {
    const { screenDefinition } = useScreenContext();
    const { translateFn } = usePanoptes();

    const translate = (key: string, opts: Record<string, unknown> = {}): string => {
        return translateFn ? translateFn(key, opts) : key;
    };

    const screenLabelKey = screenDefinition.label ?? `screens.${screenDefinition.id}`;

    const hasMultipleTabs = screenDefinition.tabs && screenDefinition.tabs.length > 1;
    const hasLinks = screenDefinition.links && screenDefinition.links.length > 0;
    const hasActions = screenDefinition.actions && screenDefinition.actions.length > 0;
    const hasSidebar = !!screenDefinition.sidebar;

    return (
        <div className={styles.screen} data-screen-id={screenDefinition.id}>
            {/* Screen header with label */}
            <header className={styles.header}>
                <h1>{translate(screenLabelKey)}</h1>
            </header>

            {/* Navigation links */}
            {hasLinks && (
                <nav className={styles.links}>
                    <ScreenLinks />
                </nav>
            )}

            {/* Tabs */}
            {hasMultipleTabs && (
                <nav className={styles.tabs}>
                    <ScreenTabs />
                </nav>
            )}

            {/* Main form content + optional sidebar */}
            <div className={hasSidebar ? styles.bodyWithSidebar : styles.body}
                 style={hasSidebar && screenDefinition.sidebar!.width
                     ? { '--sidebar-width': screenDefinition.sidebar!.width } as React.CSSProperties
                     : undefined}>
                {hasSidebar && (
                    <ScreenSidebar sidebar={screenDefinition.sidebar!} />
                )}

                <main className={styles.content}>
                    <ScreenForm />
                </main>
            </div>

            {/* Action buttons */}
            {hasActions && (
                <footer className={styles.actions}>
                    <ScreenActions />
                </footer>
            )}
        </div>
    );
}
