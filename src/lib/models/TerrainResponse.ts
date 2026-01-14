/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { StatutTerrain } from './StatutTerrain';
import type { TypeTerrain } from './TypeTerrain';
export type TerrainResponse = {
    nom: string;
    description?: (string | null);
    type_terrain: TypeTerrain;
    localite_id: string;
    latitude: number;
    longitude: number;
    superficie_totale: number;
    perimetre?: (number | null);
    pente?: (number | null);
    date_acquisition?: (string | null);
    id: string;
    statut: StatutTerrain;
    user_id: string;
    nombre_parcelles?: (number | null);
    created_at: string;
    updated_at: string;
};

