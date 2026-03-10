import FormElement from "./FormElement";
import styles from "./FormColumn.module.css";
import type {ColumnDefinition} from "./schema";

interface FormColumnProps {
    column: ColumnDefinition;
    groupId?: string;
}

export default function FormColumn({ column, groupId }: FormColumnProps) {
    if (!column.elements || column.elements.length === 0) {
        return null;
    }

    return (
        <div className={styles.column}>
            {column.elements.map((element, index) => (
                <FormElement key={`element-${index}`} element={element} groupId={groupId} />
            ))}
        </div>
    );
}
