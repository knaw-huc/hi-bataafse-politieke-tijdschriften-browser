import {useRef, useState, type MouseEvent, type PointerEvent} from "react";
import {keepPreviousData, useQuery} from "@tanstack/react-query";
import {useFacet, useSearchState, useTranslate, type FacetValues} from "@knaw-huc/faceted-search-react";
import {useDataset, usePanoptes} from "@knaw-huc/panoptes-react";
import type {PublicationSearchResultItem} from "../results/PublicationResultsCard.tsx";
import classes from "./InPrintHistogram.module.css";

const YEARS_FACET = 'jarenInOmloop';

// Clamping the period - the few titles running far outside it would otherwise flatten the chart.
const WINDOW_START = 1780;
const WINDOW_END = 1815;
const YEAR_COUNT = WINDOW_END - WINDOW_START + 1;

// The dataset holds ~450 periodicals, so a single request returns every match.
const FETCH_LIMIT = 1000;

// Stack order bottom to top.
const STANCES = ['Radicaal', 'Orangistisch', 'Moderaat', 'Onafhankelijk / Onbestemd'];
const UNKNOWN_STANCE = STANCES.length;
const STANCE_COUNT = STANCES.length + 1;

interface YearBin {
    year: number;
    counts: number[];
    total: number;
}

interface YearRange {
    start: number;
    end: number;
}

function toRange(a: number, b: number): YearRange {
    return {start: Math.min(a, b), end: Math.max(a, b)};
}

function inRange(year: number, range?: YearRange): boolean {
    return range !== undefined && year >= range.start && year <= range.end;
}

function toStance(value: unknown): number {
    const stance = Array.isArray(value) ? value[0] : value;
    const index = STANCES.indexOf(stance as string);
    return index === -1 ? UNKNOWN_STANCE : index;
}

function binByYear(items: PublicationSearchResultItem[]) {
    const bins: YearBin[] = [];
    for (let year = WINDOW_START; year <= WINDOW_END; year++)
        bins.push({year, counts: new Array(STANCE_COUNT).fill(0), total: 0});

    let undated = 0, outside = 0;
    for (const item of items) {
        const years = item.jarenInOmloop ?? [];
        if (years.length === 0) {
            undated++;
            continue;
        }

        const inWindow = years.filter(year => year >= WINDOW_START && year <= WINDOW_END);
        if (inWindow.length === 0) {
            outside++;
            continue;
        }

        const stance = toStance(item.politiekePositie);
        for (const year of inWindow) {
            bins[year - WINDOW_START].counts[stance]++;
            bins[year - WINDOW_START].total++;
        }
    }

    return {bins, undated, outside};
}

function niceScale(max: number) {
    const step = [1, 2, 5, 10, 20, 25, 50, 100, 200, 250, 500]
        .find(step => Math.ceil(max / step) <= 4) ?? 1000;
    const top = Math.max(step, Math.ceil(max / step) * step);
    const ticks = [];
    for (let tick = 0; tick <= top; tick += step)
        ticks.push(tick);
    return {top, ticks};
}

function withoutYearsFacet(facetValues: FacetValues): FacetValues {
    return Object.fromEntries(Object.entries(facetValues).filter(([key]) => key !== YEARS_FACET));
}

// The selection is the years facet's "start:end" value, whether set here or with the sidebar slider.
function getSelection(facetValues: FacetValues): YearRange | undefined {
    const [start, end] = facetValues[YEARS_FACET]?.[0]?.split(':').map(Number) ?? [];
    return Number.isFinite(start) && Number.isFinite(end) ? {start, end} : undefined;
}

// Same rule as the backend filter: a periodical matches when any of its years falls in the range.
function countInRange(items: PublicationSearchResultItem[], range: YearRange): number {
    return items.filter(item => item.jarenInOmloop?.some(year => inRange(year, range))).length;
}

function useHistogramItems() {
    const {url} = usePanoptes();
    const [dataset] = useDataset();
    const {query, facetValues} = useSearchState();

    // The chart ignores its own year filter, so every bar keeps showing what clicking it would select.
    const facets = withoutYearsFacet(facetValues);

    return useQuery({
        queryKey: ['in-print-histogram', url, dataset, query, facets],
        staleTime: 1000 * 60,
        placeholderData: keepPreviousData,
        queryFn: async ({signal}) => {
            const response = await fetch(`${url}/api/datasets/${dataset}/search`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({query: query ?? '', facets, offset: 0, limit: FETCH_LIMIT}),
                signal,
            });
            if (!response.ok)
                throw Error(`Failed to load the histogram for dataset ${dataset}!`);
            return (await response.json()).items as PublicationSearchResultItem[];
        },
    });
}

export default function InPrintHistogram() {
    const {t} = useTranslate();
    const {facetValues} = useSearchState();
    const {setValues: setYears} = useFacet(YEARS_FACET, '');
    const {data: items, isError} = useHistogramItems();
    const [hoveredYear, setHoveredYear] = useState<number>();
    const [drag, setDrag] = useState<{ anchor: number, current: number }>();
    const plotRef = useRef<HTMLDivElement>(null);

    const stanceLabels = [...STANCES, t('histogram.stance.unknown')];
    const selection = getSelection(facetValues);
    const preview = drag && toRange(drag.anchor, drag.current);
    const highlighted = preview ?? selection;
    const {bins, undated, outside} = binByYear(items ?? []);
    const {top, ticks} = niceScale(Math.max(1, ...bins.map(bin => bin.total)));
    const hovered = drag ? undefined : bins.find(bin => bin.year === hoveredYear);

    function yearAt(clientX: number): number {
        const rect = plotRef.current!.getBoundingClientRect();
        const index = Math.floor((clientX - rect.left) / rect.width * YEAR_COUNT);
        return WINDOW_START + Math.min(YEAR_COUNT - 1, Math.max(0, index));
    }

    // Shift extends the selection: its far end stays put and the clicked year becomes the other end.
    function anchorFor(year: number, extend: boolean): number {
        if (!extend || !selection)
            return year;
        return year < selection.start ? selection.end : selection.start;
    }

    function select(range: YearRange) {
        const isSelectedYear = range.start === range.end
            && range.start === selection?.start && range.end === selection?.end;
        setYears(isSelectedYear ? '' : `${range.start}:${range.end}`);
    }

    function onPointerDown(e: PointerEvent<HTMLDivElement>) {
        if (e.button !== 0)
            return;
        const year = yearAt(e.clientX);
        e.currentTarget.setPointerCapture(e.pointerId);
        setDrag({anchor: anchorFor(year, e.shiftKey), current: year});
    }

    function onPointerMove(e: PointerEvent<HTMLDivElement>) {
        const year = yearAt(e.clientX);
        if (drag && year !== drag.current)
            setDrag({...drag, current: year});
    }

    function onPointerUp() {
        if (drag)
            select(toRange(drag.anchor, drag.current));
        setDrag(undefined);
    }

    // Pointer clicks are handled by the drag on the plot; this is Enter/Space on a focused bar.
    function onBarClick(e: MouseEvent<HTMLButtonElement>, year: number) {
        if (e.detail === 0)
            select(toRange(anchorFor(year, e.shiftKey), year));
    }

    return (
        <section className={classes.root} aria-labelledby="in-print-histogram-title">
            <div className={classes.header}>
                <div>
                    <h2 id="in-print-histogram-title" className={classes.title}>{t('histogram.title')}</h2>
                    <p id="in-print-histogram-hint" className={classes.subtitle}>{t('histogram.subtitle')}</p>
                </div>
                <ul className={classes.legend}>
                    {stanceLabels.map((label, stance) =>
                        <li key={label}>
                            <span className={classes.swatch} style={{background: `var(--stance-${stance + 1})`}}/>
                            {label}
                        </li>)}
                </ul>
            </div>

            {isError
                ? <p className={classes.note}>{t('histogram.error')}</p>
                : <div className={classes.chart}>
                    <div className={classes.yAxis} aria-hidden="true">
                        {ticks.map(tick =>
                            <span key={tick} style={{bottom: `${tick / top * 100}%`}}>{tick}</span>)}
                    </div>

                    <div ref={plotRef}
                         className={classes.plot}
                         onPointerDown={onPointerDown}
                         onPointerMove={onPointerMove}
                         onPointerUp={onPointerUp}
                         onPointerCancel={() => setDrag(undefined)}>
                        {ticks.map(tick =>
                            <span key={tick} className={classes.gridline} style={{bottom: `${tick / top * 100}%`}}/>)}

                        {bins.map(bin =>
                            <button key={bin.year}
                                    type="button"
                                    className={classes.bar}
                                    data-in-range={inRange(bin.year, highlighted)}
                                    data-dimmed={highlighted !== undefined && !inRange(bin.year, highlighted)}
                                    aria-pressed={inRange(bin.year, selection)}
                                    aria-label={t('histogram.bar.aria', {year: bin.year, count: bin.total})}
                                    aria-describedby="in-print-histogram-hint"
                                    onClick={e => onBarClick(e, bin.year)}
                                    onPointerEnter={() => setHoveredYear(bin.year)}
                                    onPointerLeave={() => setHoveredYear(undefined)}
                                    onFocus={e => e.currentTarget.matches(':focus-visible') && setHoveredYear(bin.year)}
                                    onBlur={() => setHoveredYear(undefined)}>
                                <span className={classes.stack} style={{height: `${bin.total / top * 100}%`}}>
                                    {bin.counts.map((count, stance) => count > 0 &&
                                        <span key={stance}
                                              className={classes.segment}
                                              style={{flexGrow: count, background: `var(--stance-${stance + 1})`}}/>)}
                                </span>
                                <span className={classes.xLabel} data-minor={bin.year % 10 !== 0} aria-hidden="true">
                                    {bin.year % 5 === 0 ? bin.year : ''}
                                </span>
                            </button>)}

                        {hovered && hovered.total > 0 &&
                            <Tooltip bin={hovered} labels={stanceLabels}
                                     isSelected={selection?.start === hovered.year && selection.end === hovered.year}/>}

                        {preview &&
                            <div className={classes.rangeLabel}
                                 style={{left: `${(preview.start + preview.end + 1 - 2 * WINDOW_START) / 2 / YEAR_COUNT * 100}%`}}
                                 aria-hidden="true">
                                {t('histogram.range', {
                                    period: preview.start === preview.end
                                        ? preview.start : `${preview.start}–${preview.end}`,
                                    count: countInRange(items ?? [], preview)
                                })}
                            </div>}
                    </div>
                </div>}

            {(undated > 0 || outside > 0) && <p className={classes.note}>
                {undated > 0 && t('histogram.undated', {count: undated})}
                {undated > 0 && outside > 0 && ' '}
                {outside > 0 && t('histogram.outside', {count: outside, start: WINDOW_START, end: WINDOW_END})}
            </p>}

            {/*<details className={classes.tableView}>
                <summary>{t('histogram.table.toggle')}</summary>
                <table>
                    <thead>
                    <tr>
                        <th scope="col">{t('histogram.table.year')}</th>
                        {stanceLabels.map(label => <th key={label} scope="col">{label}</th>)}
                        <th scope="col">{t('histogram.table.total')}</th>
                    </tr>
                    </thead>
                    <tbody>
                    {bins.filter(bin => bin.total > 0).map(bin =>
                        <tr key={bin.year}>
                            <th scope="row">{bin.year}</th>
                            {bin.counts.map((count, stance) => <td key={stance}>{count}</td>)}
                            <td>{bin.total}</td>
                        </tr>)}
                    </tbody>
                </table>
            </details>*/}
        </section>
    );
}

function Tooltip({bin, labels, isSelected}: { bin: YearBin, labels: string[], isSelected: boolean }) {
    const {t} = useTranslate();
    const position = (bin.year - WINDOW_START + 0.5) / (WINDOW_END - WINDOW_START + 1);

    // The arrow sits exactly under the bar; the box centres on it but is clamped inside the plot.
    return <>
        <span className={classes.tooltipArrow} style={{left: `${position * 100}%`}} aria-hidden="true"/>
        <div className={classes.tooltip}
             style={{left: `clamp(var(--tooltip-half), ${position * 100}%, calc(100% - var(--tooltip-half)))`}}
             aria-hidden="true">
            <div className={classes.tooltipHeader}>
                <strong>{bin.total}</strong> {t('histogram.tooltip.total', {year: bin.year, count: bin.total})}
            </div>
            <ul>
                {[...bin.counts.keys()].reverse().map(stance =>
                    <li key={stance}>
                        <span className={classes.lineKey} style={{background: `var(--stance-${stance + 1})`}}/>
                        <strong>{bin.counts[stance]}</strong> {labels[stance]}
                    </li>)}
            </ul>
            <div className={classes.tooltipHint}>
                {t(isSelected ? 'histogram.tooltip.clear' : 'histogram.tooltip.select')}
            </div>
        </div>
    </>;
}
