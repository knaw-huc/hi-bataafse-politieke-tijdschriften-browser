import React from 'react';
import * as LucideIcons from 'lucide-react';
import type {LucideProps} from 'lucide-react';
import type {SidebarDefinition, SidebarNavItemDefinition} from './schema';
import styles from './ScreenSidebar.module.css';
import {usePanoptes} from "@knaw-huc/panoptes-react";

interface ScreenSidebarProps {
    sidebar: SidebarDefinition;
}

function NavIcon({ name }: { name: string }) {
    const pascal = name.charAt(0).toUpperCase() + name.slice(1).replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    const Icon = (LucideIcons as unknown as Record<string, React.ComponentType<LucideProps>>)[pascal];
    if (!Icon) {
        return <span className={styles.iconFallback}>{name.charAt(0).toUpperCase()}</span>;
    }
    return <Icon size={20} strokeWidth={1.5} />;
}

function NavItem({ item }: { item: SidebarNavItemDefinition }) {
    const { translateFn } = usePanoptes();

    const className = `${styles.item}${item.active ? ` ${styles.itemActive}` : ''}`;
    const content = (
        <>
            <NavIcon name={item.icon} />
            <span className={styles.tooltip}>{translateFn ? translateFn(item.label) : item.label}</span>
        </>
    );


    return <button type="button" className={className} title={item.label}>{content}</button>;
}

export default function ScreenSidebar({ sidebar }: ScreenSidebarProps) {
    return (
        <aside className={styles.sidebar} data-sidebar-id={sidebar.id}>
            {sidebar.sections.map((section, index) => (
                <div key={section.id} className={styles.section}>
                    {index > 0 && <hr className={styles.divider} />}
                    {section.items.map(item => (
                        <NavItem key={item.id} item={item} />
                    ))}
                </div>
            ))}
        </aside>
    );
}
