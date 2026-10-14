import {startTransition, useState} from "react";
import {
    FacetedSearch,
    HookedPagination,
    SelectedFacets,
    getReadableRange,
    useSelectedFacets,
    type Facets as IFacets
} from "@knaw-huc/faceted-search-react";
import {useDataset, useFacets, usePanoptes, type Facet} from "@knaw-huc/panoptes-react";
import Facets from "./Facets.tsx";
import Results from "./Results.tsx";
import InPrintHistogram from "./InPrintHistogram.tsx";
import classes from "./Search.module.css";

// The in-print histogram is built on the periodicals' first/last issue years, so only that dataset shows it
const histogramDatasets = ['politieke-tijdschriften'];

function getValueRenderer(facet: Facet): ((value: string, valueLabel?: string) => string) | undefined {
    switch (facet.type) {
        case 'range':
            return value => {
                // A single-year range, as set by clicking the histogram, reads as just that year.
                const [start, end] = value.split(':');
                return start === end ? start : getReadableRange(value, false);
            };
    }
}

// Like HookedSelectedFacets, but also notifies on "clear filters".
function HookedSelectedFacetsWithClear({onClear}: { onClear: () => void }) {
    const [selectedFacets, clearFacets] = useSelectedFacets();
    return <SelectedFacets selectedFacets={selectedFacets} onClear={() => {
        clearFacets();
        onClear();
    }}/>;
}

export default function Search() {
    const {data: registeredFacets} = useFacets();
    // The facets' text filters are local state inside faceted-search-react, so "clear filters" can only
    // reset them by remounting the facets. In a transition, so a suspending remount keeps the old facets.
    const [facetsKey, setFacetsKey] = useState(0);
    const {translateFn, locale, pageSize} = usePanoptes();
    const [dataset] = useDataset();

    const facets = registeredFacets.reduce<IFacets>((acc, facet) => {
        acc[facet.property] = {
            label: facet.name,
            valueRenderer: getValueRenderer(facet),
        };
        return acc;
    }, {});

    return (
        <FacetedSearch facets={facets} pageSize={pageSize} translate={translateFn} locale={locale}>
            <div className={classes.search}>
                <div className={classes.facets}>
                    <Facets key={facetsKey}/>
                </div>
                <div className={classes.results}>
                    {histogramDatasets.includes(dataset) && <InPrintHistogram/>}
                    <HookedSelectedFacetsWithClear onClear={() => startTransition(() => setFacetsKey(key => key + 1))}/>
                    <Results/>
                    <HookedPagination/>
                </div>
            </div>
        </FacetedSearch>
    );
}
