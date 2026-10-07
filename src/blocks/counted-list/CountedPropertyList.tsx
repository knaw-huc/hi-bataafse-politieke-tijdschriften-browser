import classes from './CountedPropertyList.module.css';
import {usePanoptes} from "@knaw-huc/panoptes-react";

type CountedPropertyListValue = CountedPropertyListData | CountedPropertyListValue[] | string | number | boolean | null;

export interface CountedPropertyListData {
    [label: string]: CountedPropertyListValue | CountedPropertyListValue[];
}

export default function CountedPropertyList({data}: { data: CountedPropertyListData | CountedPropertyListValue[] }) {
    const entries = Array.isArray(data)
        ? data.map((value, index) => [String(index + 1), value] as const)
        : Object.entries(data);

    return (
        <dl className={classes.list}>
            {entries.map(([key, value]) =>
                <PropertyListItem key={key} label={key} value={value}/>)}
        </dl>
    );
}

function PropertyListItem({label, value}: { label: string, value: CountedPropertyListValue | CountedPropertyListValue[] }) {
    return (
        <div className={classes.item}>
            <PropertyListLabel label={label}/>
            <PropertyListValues value={value}/>
        </div>
    );
}

function PropertyListLabel({label}: { label: string }) {
    return (
        <dt className={classes.label}>
            {label
                .replace(/_/g, ' ')
                .replace(/([a-z])([A-Z][a-z])/g, '$1 $2')
                .toLowerCase()
                .replace(/^\w/, (c) => c.toUpperCase())}
        </dt>
    );
}

function PropertyListValues({value}: { value: CountedPropertyListValue | CountedPropertyListValue[] }) {
    const values = Array.isArray(value) ? (value.length > 0 ? value : [null]) : [value];

    return (
        <dd className={classes.value}>
            {values.length > 1 ? <ul>
                {values.map((value, index) => <li key={index}>
                    <PropertyListValue value={value}/>
                </li>)}
            </ul> : <PropertyListValue value={values[0]}/>}
        </dd>
    );
}

function PropertyListValue({value}: { value: CountedPropertyListValue }) {
    const { translateFn } = usePanoptes();

    if (value === null) {
        return <span className={classes.empty}
                     title={translateFn ? translateFn('panoptes.noValue') : 'No value'}>—</span>;
    }

    switch (typeof value) {
        case 'object':
            return <CountedPropertyList data={value}/>;
        case 'boolean':
            return value ? (translateFn ? translateFn('panoptes.yes') : 'Yes')
                            : (translateFn ? translateFn('panoptes.no') : 'No');
        case 'number':
            return value.toLocaleString();
        default:
            return <pre className={classes.text}>{value}</pre>;
    }
}
