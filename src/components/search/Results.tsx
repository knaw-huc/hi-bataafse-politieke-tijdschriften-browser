import {useDeferredValue} from "react";
import {useRouter} from "@tanstack/react-router";
import {HookedResultsView, type SearchState} from "@knaw-huc/faceted-search-react";
import {useDataset, usePanoptes, useSearch} from "@knaw-huc/panoptes-react";
import type {PublicationSearchResultItem} from "../results/PublicationResultsCard.tsx";

const resolveId = (item: PublicationSearchResultItem) => item.id;

// Searching with a deferred state keeps the current results on screen while the next ones load,
// instead of suspending the whole page (see useDeferredFacet.ts).
const useDeferredSearch = (state: SearchState) =>
    useSearch<PublicationSearchResultItem>(useDeferredValue(state));

export default function Results() {
    const router = useRouter();
    const [dataset] = useDataset();
    const {detailPath, resultCardRenderer} = usePanoptes();

    return (
        <HookedResultsView<PublicationSearchResultItem> useResults={useDeferredSearch} id={resolveId}>
            {result => resultCardRenderer(result, router.buildLocation({
                to: detailPath,
                params: {dataset, id: resolveId(result)}
            }).href)}
        </HookedResultsView>
    );
}
