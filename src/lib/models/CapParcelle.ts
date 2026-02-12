/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Schema for the association between a sensor (capteur) and a plot (parcelle).
 */
export type CapParcelle = {
    id: string;
    created_at: string;
    updated_at: string;
    capteur_id: string;
    parcelle_id: string;
    date_assignation: string;
    date_desassignation?: (string | null);
};

