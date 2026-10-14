import type {ComponentType} from "react";
import PublicationResultsCard, {type PublicationResultCardProps} from "./PublicationResultsCard.tsx";

// Result card per dataset - datasets without an entry use the configured Panoptes resultCardRenderer, that's ok
export const resultCards: Partial<Record<string, ComponentType<PublicationResultCardProps>>> = {
    'politieke-tijdschriften': PublicationResultsCard,
};
