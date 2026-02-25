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
                <legend className={styles.label}>
                    {translate(groupLabelKey)}
                </legend>
            )}

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
        </fieldset>
    );
}
