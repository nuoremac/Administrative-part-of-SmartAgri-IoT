/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Address } from './Address';
import type { ClimateZone } from './ClimateZone';
import type { Coordinates } from './Coordinates';
export type LocaliteCreate = {
    nom: string;
    coordinates: Coordinates;
    address: Address;
    timezone: string;
    superficie?: (number | null);
    population?: (number | null);
    climate_zone?: (ClimateZone | null);
};

