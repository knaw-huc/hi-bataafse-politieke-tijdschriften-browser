import i18next from 'i18next';
import nl from './locales/nl/common.json';
import type {TranslateFn} from '@knaw-huc/faceted-search-react';

i18next.init({
    lng: 'nl',
    fallbackLng: 'nl',
    resources: {
        nl: {translation: nl},
    },
    interpolation: {
        escapeValue: false,
    },
});

export function createTranslate(): TranslateFn {
    return (key: string, options?: Record<string, unknown>): string => i18next.t(key, options);
}

