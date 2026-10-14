import {useDeferredValue} from "react";
import {useSuspenseQuery} from "@tanstack/react-query";
import {useSearchState, type FilterFacetItem, type FilterFacetState} from "@knaw-huc/faceted-search-react";
import {useDataset, usePanoptes} from "@knaw-huc/panoptes-react";

// Replacements for panoptes-react's useTextFacetItems and useRangeFacet that query with a deferred
// copy of the search state. Those hooks suspend on every filter change, and since the filter state
// lives in an external store React cannot hold the old screen, so the whole page fell back to the
// route's spinner. With a deferred state React keeps the current page until the new counts arrive.

interface FacetResult {
    count: number;
    value: string;
    name?: string;
    children?: FacetResult[];
}

interface RangeTerm {
    count: number;
    start: number | string;
    end: number | string;
}

function useFacetResults<R>(name: string, filter: string, sort: string): R[] {
    const {url} = usePanoptes();
    const [dataset] = useDataset();
    const {query, facetValues} = useDeferredValue(useSearchState());

    const {data} = useSuspenseQuery({
        queryKey: ['facet', url, dataset, name, 100, filter, query, sort, facetValues],
        staleTime: 1000 * 60 * 5,
        queryFn: async () => {
            const response = await fetch(`${url}/api/datasets/${dataset}/facet/${name}`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({name, amount: 100, filter, sort, query, facets: facetValues}),
            });
            if (!response.ok)
                throw Error(`Unable to fetch facet results for dataset ${dataset}!`);
            return (await response.json()) as R[];
        },
    });
    return data;
}

const toItems = (results: FacetResult[]): FilterFacetItem[] =>
    results.map(result => ({
        itemKey: result.value,
        label: result.name || result.value,
        amount: result.count,
        children: result.children ? toItems(result.children) : [],
    }));

export function useDeferredTextFacetItems(facetState: FilterFacetState): FilterFacetItem[] {
    // Deferred too, so typing in a facet's filter box doesn't suspend the page either.
    const {facetKey, textFilter, sort} = useDeferredValue(facetState);
    return toItems(useFacetResults<FacetResult>(facetKey, textFilter, sort));
}

export function useDeferredRangeFacet(name: string): { terms: RangeTerm[] } {
    return {terms: useFacetResults<RangeTerm>(name, '', 'hits')};
}
