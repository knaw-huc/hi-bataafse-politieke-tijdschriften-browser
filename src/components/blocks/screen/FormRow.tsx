import {useState} from 'react';
import FormColumn from './FormColumn';
import FormElement from './FormElement';
import styles from './FormRow.module.css';
import type {RowDefinition} from "./schema";
import {usePanoptes} from "@knaw-huc/panoptes-react";
import {useScreenContext} from "./hooks";

interface FormRowProps {
    row: RowDefinition;
    inheritedGroupId?: string;
}

export default function FormRow({ row, inheritedGroupId }: FormRowProps) {
    const { translateFn } = usePanoptes();
    const translate = (key: string): string => translateFn ? translateFn(key) : key;
    const { screenDefinition } = useScreenContext();

    const effectiveGroupId = row.groupId ?? inheritedGroupId;

    const groupLabelKey = row.label
        ?? (row.groupId ? `screens.${screenDefinition.id}.${row.groupId}` : undefined);

    const displayType = row.displayType || 'row';
    const hasRows = row.rows && row.rows.length > 0;
    const hasColumns = row.columns && row.columns.length > 0;
    const hasElements = row.elements && row.elements.length > 0;

    const isCollapsible = row.collapsible && displayType === 'group';
    const [collapsed, setCollapsed] = useState(isCollapsible ? (row.defaultCollapsed ?? false) : false);

    const getRowClassName = () => {
        const classes = [styles.row];
        switch (displayType) {
            case 'header':
                classes.push(styles.header);
                break;
            case 'group':
                classes.push(styles.group);
                break;
            case 'footer':
                classes.push(styles.footer);
                break;
        }
        return classes.join(' ');
    };

    return (
        <fieldset
            className={getRowClassName()}
            data-group-id={row.groupId}>
            {/* Group label/legend */}
            {groupLabelKey && (
                isCollapsible ? (
                    <legend className={`${styles.label} ${styles.labelCollapsible}`}>
                        <button
                            type="button"
                            className={styles.collapseToggle}
                            onClick={() => setCollapsed(c => !c)}
                            aria-expanded={!collapsed}>
                            <svg
                                className={`${styles.chevron} ${collapsed ? styles.chevronCollapsed : ''}`}
                                viewBox="0 0 24 24" width="14" height="14"
                                fill="none" stroke="currentColor" strokeWidth="2.5"
                                strokeLinecap="round" strokeLinejoin="round"
                                aria-hidden="true">
                                <polyline points="6 9 12 15 18 9" />
                            </svg>
                            {translate(groupLabelKey)}
                        </button>
                    </legend>
                ) : (
                    <legend className={styles.label}>
                        {translate(groupLabelKey)}
                    </legend>
                )
            )}

            {!collapsed && (
                <>
                    {/* Render nested rows if present */}
                    {hasRows && row.rows!.map((nestedRow, index) => (
                        <FormRow key={nestedRow.groupId || `row-${index}`} row={nestedRow} inheritedGroupId={effectiveGroupId} />
                    ))}

                    {/* Render columns if present */}
                    {!hasRows && hasColumns && (
                        <div className={styles.columns}>
                            {row.columns!.map((column, index) => (
                                <FormColumn key={`column-${index}`} column={column} groupId={effectiveGroupId} />
                            ))}
                        </div>
                    )}

                    {/* Render elements directly if no columns or nested rows */}
                    {!hasRows && !hasColumns && hasElements && (
                        <div className={styles.elements}>
                            {row.elements!.map((element, index) => (
                                <FormElement key={`element-${index}`} element={element} groupId={effectiveGroupId} />
                            ))}
                        </div>
                    )}
                </>
            )}
        </fieldset>
    );
}
