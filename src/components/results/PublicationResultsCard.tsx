import {ResultCard, type ResultCardProps, usePanoptes} from "@knaw-huc/panoptes-react";

export interface PublicationSearchResultItem {
    id: string;
    title: string;
    description?: string;
    tags?: string[];
    numPublications: string;
}

export interface PublicationResultCardProps extends PublicationSearchResultItem {
    link: string;
}

export default function PublicationResultsCard(props: PublicationResultCardProps) {
    const {translateFn} = usePanoptes();

    const title = translateFn && translateFn('searchResults.title', {
        title: props.title,
        numPublications: props.numPublications || '—'
    }) || props.title;

    const resultCardProps: ResultCardProps = {
        title,
        link: props.link,
        tags: props.tags,
    };
    return (
        <ResultCard {...resultCardProps} />
    );
}