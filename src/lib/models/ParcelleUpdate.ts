/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { StatutParcelle } from './StatutParcelle';
import type { SystemeIrrigation } from './SystemeIrrigation';
export type ParcelleUpdate = {
    nom?: (string | null);
    description?: (string | null);
    statut?: (StatutParcelle | null);
    superficie?: (number | null);
    systeme_irrigation?: (SystemeIrrigation | null);
    culture_actuelle?: (string | null);
    date_plantation?: (string | null);
};

