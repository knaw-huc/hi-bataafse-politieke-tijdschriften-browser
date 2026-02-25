import {Suspense} from "react";
import type {ElementDefinition} from "./schema";
import {type Block, useBlock, usePanoptes} from "@knaw-huc/panoptes-react";
import {useElementState, useScreenContext} from "./hooks";
import GhostLine from "../../ghostline/Ghostline.tsx";
import styles from './FormElement.module.css';
import {ErrorBoundary} from "react-error-boundary";
import {ItemDataProvider} from "./context/ItemDataContext.tsx";
import {getNestedValue, parseBinding} from "./schema";

interface FormElementProps {
    element: ElementDefinition;
    groupId?: string;
}

const inferElementType = (value: unknown): string => {
    if (Array.isArray(value)) {
        return 'array';
    }
    if (typeof value === 'boolean') {
        return 'checkbox';
    }
    if (typeof value === 'number') {
        return 'number';
    }
    if (typeof value === 'string') {
        if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
            return 'date';
        }
        if (value.includes('\n')) {
            return 'textarea';
        }
    }
    return 'text';
}

const renderValue = (type: string, value: unknown,
                     element: ElementDefinition) => {
    const commonProps = {
        readOnly: true,
        disabled: true,
        'aria-label': element.label,
    };

    switch (type) {
        case 'prose':
            return (
                <span className='pr-4'>{String(value ?? '')}</span>
            );

        case 'checkbox':
            return (
                <input
                    type="checkbox"
                    checked={Boolean(value)}
                    {...commonProps}
                />
            );

        case 'number':
            return (
                <input
                    type="number"
                    value={value as number ?? ''}
                    {...commonProps}
                />
            );

        case 'date':
            return (
                <input
                    type="date"
                    value={String(value ?? '')}
                    {...commonProps}
                />
            );

        case 'textarea':
            return (
                <textarea
                    value={String(value ?? '')}
                    {...commonProps}
                />
            );

        case 'array':
            return (
                <ArrayDisplay
                    value={value as unknown[]}
                    element={element}
                />
            );

        case 'select': {
            const options = (element.config?.options as Array<{ value: string; label: string }>) || [];
            const selected = options.find(opt => opt.value === String(value ?? ''));
            return (
                <input
                    type="text"
                    value={selected?.label ?? String(value ?? '')}
                    {...commonProps}
                />
            );
        }

        case 'text':
        default:
            return (
                <input
                    type="text"
                    value={String(value ?? '')}
                    {...commonProps}
                />
            );
    }
}

const ConfiguredBlockRenderer = ({ element, groupId }: {
    element: ElementDefinition;
    groupId?: string;
}) => {
    const {
        value,
        label,
        infoLabel
    } = useElementState(element, groupId);
    const { translateFn } = usePanoptes();
    const translate = (key: string): string => translateFn ? translateFn(key) : key;
    const BlockComponent = useBlock(element as Block);
    const screenContext = useScreenContext();

    if (!BlockComponent) {
        return null;
    }

    const block = { ...element, value, model: screenContext.data } as Block;
    return (
        <div className={styles.element}>
            {label && (
                <label className={styles.label}>
                    {translate(label)}
                </label>
            )}
            <Suspense fallback={<GhostLine/>}>
                <BlockComponent block={block} />
            </Suspense>
            {infoLabel && (
                <span className={styles.info}>
                    {translate(infoLabel)}
                </span>
            )}
        </div>

    );
};

const FallbackBlockRenderer = ({ element, groupId }: FormElementProps) => {
    const { translateFn } = usePanoptes();
    const {
        value,
        label,
        infoLabel
    } = useElementState(element, groupId);
    const translate = (key: string): string => translateFn ? translateFn(key) : key;

    const elementType = element.type || inferElementType(value);

    return (
        <div className={styles.element}>
            {label && (
                <label className={styles.label}>
                    {translate(label)}
                </label>
            )}

            {renderValue(elementType, value, element)}

            {infoLabel && (
                <span className={styles.info}>
                    {translate(infoLabel)}
                </span>
            )}
        </div>
    );
};

export default function FormElement({ element, groupId }: FormElementProps) {
    if (element.hidden) {
        return null;
    }

    return (
        <ErrorBoundary fallback={<FallbackBlockRenderer element={element} groupId={groupId} />}>
            <ConfiguredBlockRenderer element={element} groupId={groupId} />
        </ErrorBoundary>
    );
}

interface ItemTemplateField {
    label: string;
    type: string;
    value: string;
}

interface ItemTemplate {
    [key: string]: ItemTemplateField;
}

interface ArrayDisplayProps {
    value: unknown[];
    element: ElementDefinition;
}

function isEmptyItem(item: unknown, itemTemplate: ItemTemplate | undefined): boolean {
    if (itemTemplate) {
        return Object.values(itemTemplate).every(field => {
            const parsed = parseBinding(field.value);
            const v = getNestedValue(item, parsed.path);
            return v == null || String(v).trim() === '';
        });
    }
    return item == null || String(item).trim() === '';
}

function ArrayDisplay({ value, element }: ArrayDisplayProps) {
    const items = Array.isArray(value) ? value : [];
    const itemTemplate = element.config?.itemTemplate as ItemTemplate | undefined;

    if (items.length === 0 || items.every(item => isEmptyItem(item, itemTemplate))) {
        return null;
    }

    if (itemTemplate) {
        return (
            <div className={styles.arrayInput}>
                {items.map((item, index) => (
                    <ItemDataProvider key={index} item={item as Record<string, unknown>}>
                        {!isEmptyItem(item, itemTemplate) && <div className={styles.arrayItem}>
                            <div className={styles.arrayItemFields}>
                                {Object.entries(itemTemplate).map(([field, config]) => (
                                    <div className={styles.arrayItemField}>
                                        <FormElement key={field} element={config} />
                                    </div>
                                ))}
                            </div>
                        </div>}
                    </ItemDataProvider>
                ))}
            </div>
        );
    }

    return (
        <div className={styles.arrayInput}>
            {items.map((item, index) => (
                <div key={index} className={styles.arrayItem}>
                    <input
                        type="text"
                        value={String(item ?? '')}
                        readOnly
                        disabled
                    />
                </div>
            ))}
        </div>
    );
}
