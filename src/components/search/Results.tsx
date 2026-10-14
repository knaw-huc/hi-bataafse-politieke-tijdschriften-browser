import {useDeferredValue} from "react";
import {useRouter} from "@tanstack/react-router";
import {HookedResultsView, type SearchState} from "@knaw-huc/faceted-search-react";
import {useDataset, usePanoptes, useSearch} from "@knaw-huc/panoptes-react";
import type {PublicationSearchResultItem} from "../results/PublicationResultsCard.tsx";
import {resultCards} from "../results/resultCards.ts";

const resolveId = (item: PublicationSearchResultItem) => item.id;

// Searching with a deferred state keeps the current results on screen while the next ones load,
// instead of suspending the whole page (see useDeferredFacet.ts).
const useDeferredSearch = (state: SearchState) =>
    useSearch<PublicationSearchResultItem>(useDeferredValue(state));

export default function Results() {
    const router = useRouter();
    const [dataset] = useDataset();
    const {detailPath, resultCardRenderer} = usePanoptes();
    const ResultCard = resultCards[dataset];

    return (
        <HookedResultsView<PublicationSearchResultItem> useResults={useDeferredSearch} id={resolveId}>
            {result => {
                const link = router.buildLocation({
                    to: detailPath,
                    params: {dataset, id: resolveId(result)}
                }).href;
                return ResultCard ? <ResultCard {...result} link={link}/> : resultCardRenderer(result, link);
            }}
        </HookedResultsView>
    );
}
