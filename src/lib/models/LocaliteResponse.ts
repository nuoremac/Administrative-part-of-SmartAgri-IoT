/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ClimateZone } from './ClimateZone';
import type { Continent } from './Continent';
export type LocaliteResponse = {
    id: string;
    nom: string;
    latitude: number;
    longitude: number;
    altitude: (number | null);
    quartier: (string | null);
    ville: string;
    region: (string | null);
    pays: string;
    code_postal: (string | null);
    continent: Continent;
    timezone: string;
    superficie: (number | null);
    population: (number | null);
    climate_zone: (ClimateZone | null);
    created_at: string;
    updated_at: string;
};

