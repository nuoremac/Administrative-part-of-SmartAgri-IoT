/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ClimateZone } from './ClimateZone';
import type { Continent } from './Continent';
export type LocaliteResponse = {
    nom: string;
    ville: string;
    region?: (string | null);
    pays: string;
    continent: Continent;
    climate_zone?: (ClimateZone | null);
    id: string;
    created_at: string;
    updated_at: string;
};

