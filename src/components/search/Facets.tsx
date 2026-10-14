import {
    FacetsSection,
    HookedDateRangeFacet,
    HookedFilterFacet,
    HookedNumericRangeFacet,
    HookedSearchFacet
} from "@knaw-huc/faceted-search-react";
import {
    useFacets,
    type Facet,
    type HistogramFacet,
    type RangeFacet,
    type TextFacet,
    type TreeFacet
} from "@knaw-huc/panoptes-react";
import {useDeferredRangeFacet, useDeferredTextFacetItems} from "./useDeferredFacet.ts";

// Still registered (so filtering on them and their chips keep working), just not shown in the sidebar;
// the histogram covers the years.
const HIDDEN_FACETS = ['jarenInOmloop', 'eersteNummerJaar', 'laatsteNummerJaar'];

export default function Facets() {
    const {data: facets} = useFacets();

    return (
        <FacetsSection>
            <HookedSearchFacet/>

            {facets.filter(facet => !HIDDEN_FACETS.includes(facet.property)).map(facet =>
                <FacetRendering key={facet.property} facet={facet}/>)}
        </FacetsSection>
    );
}

function FacetRendering({facet}: { facet: Facet }) {
    switch (facet.type) {
        case 'range':
            return <RangeFacetRendering facet={facet as RangeFacet}/>;
        case 'text':
            return <TextFacetRendering facet={facet as TextFacet}/>;
        case 'tree':
            return <TreeFacetRendering facet={facet as TreeFacet}/>;
        case 'histogram':
            return <HistogramFacetRendering facet={facet as HistogramFacet} type="numeric"/>;
        case 'date':
            return <HistogramFacetRendering facet={facet as HistogramFacet} type="date"/>;
    }
}

function RangeFacetRendering({facet}: { facet: RangeFacet }) {
    const {terms} = useDeferredRangeFacet(facet.property);
    return (
        <HookedNumericRangeFacet facetKey={facet.property}
                                 min={terms[0].start as number}
                                 max={terms[terms.length - 1].end as number}
                                 startOpen={facet.startOpen}
                                 step={1}/>
    );
}

function TextFacetRendering({facet}: { facet: TextFacet }) {
    return (
        <HookedFilterFacet facetKey={facet.property}
                           startOpen={facet.startOpen}
                           useItems={useDeferredTextFacetItems}/>
    );
}

function TreeFacetRendering({facet}: { facet: TreeFacet }) {
    return (
        <HookedFilterFacet facetKey={facet.property}
                           startOpen={facet.startOpen}
                           initialLevels={facet.expand_level}
                           useItems={useDeferredTextFacetItems}/>
    );
}

function HistogramFacetRendering({facet, type}: { facet: HistogramFacet, type: 'numeric' | 'date' }) {
    const {terms} = useDeferredRangeFacet(facet.property);

    if (type === 'numeric') {
        return (
            <HookedNumericRangeFacet facetKey={facet.property}
                                     min={terms[0].start as number}
                                     max={terms[terms.length - 1].end as number}
                                     terms={terms}
                                     startOpen={facet.startOpen}
                                     step={1}/>
        );
    }
    return (
        <HookedDateRangeFacet facetKey={facet.property}
                              min={terms[0].start as string}
                              max={terms[terms.length - 1].end as string}
                              terms={terms}
                              startOpen={facet.startOpen}/>
    );
}
