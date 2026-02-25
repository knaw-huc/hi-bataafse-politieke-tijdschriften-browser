import { useState, useCallback } from 'react';
import styles from './ScreenActions.module.css';
import {useScreenContext} from "./hooks";
import type {ActionDefinition} from "./schema";
import {usePanoptes} from "@knaw-huc/panoptes-react";

export default function ScreenActions() {
    const { screenDefinition } = useScreenContext();

    const { actions } = screenDefinition;

    if (!actions || actions.length === 0) {
        return null;
    }

    return (
        <div className={styles.actions}>
            {actions.map((action) => (
                <ActionButton key={action.id} action={action} />
            ))}
        </div>
    );
}

interface ActionButtonProps {
    action: ActionDefinition;
}

function ActionButton({ action }: ActionButtonProps) {
    const { screenDefinition, data } = useScreenContext();
    const { translateFn } = usePanoptes();
    const translate = (key: string): string => translateFn ? translateFn(key) : key;

    const [showConfirmation, setShowConfirmation] = useState(false);
    const [isExecuting, setIsExecuting] = useState(false);

    const executeAction = useCallback(async () => {
        setIsExecuting(true);
        try {
            // TODO: Execute operation via eg. useOperation hook
            console.log('Executing operation:', action.operation, 'with data:', data);
        } finally {
            setIsExecuting(false);
            setShowConfirmation(false);
        }
    }, [action.operation, data]);

    const needsConfirmation = action.confirmation.askConfirmation === 'always';

    const handleClick = useCallback(() => {
        if (needsConfirmation) {
            setShowConfirmation(true);
        } else {
            executeAction();
        }
    }, [needsConfirmation, executeAction]);

    const handleConfirm = useCallback(() => {
        executeAction();
    }, [executeAction]);

    const handleCancel = useCallback(() => {
        setShowConfirmation(false);
    }, []);

    const autoKey = `screens.${screenDefinition.id}.actions.${action.id}`;
    const labels = action.confirmation.labels;

    return (
        <>
            <button
                className={styles.button}
                onClick={handleClick}
                disabled={isExecuting}
                data-action-id={action.id}>
                {isExecuting ? '...' : translate(action.label ?? autoKey)}
            </button>

            {showConfirmation && (
                <div className={styles.confirmationOverlay}>
                    <div className={styles.confirmationDialog} role="dialog" aria-modal="true">
                        <h2 className={styles.confirmationTitle}>
                            {translate(labels?.title ?? `${autoKey}.title`)}
                        </h2>
                        <p className={styles.confirmationMessage}>
                            {translate(labels?.message ?? `${autoKey}.message`)}
                        </p>
                        <div className={styles.confirmationActions}>
                            <button
                                className={styles.confirmationCancel}
                                onClick={handleCancel}>
                                {translate(labels?.cancel ?? `${autoKey}.cancel`)}
                            </button>
                            <button
                                className={styles.confirmationOk}
                                onClick={handleConfirm}>
                                {translate(labels?.ok ?? `${autoKey}.ok`)}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
