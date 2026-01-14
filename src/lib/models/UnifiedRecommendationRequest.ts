/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { SoilData } from './SoilData';
/**
 * Requête combinée du frontend
 */
export type UnifiedRecommendationRequest = {
    soil_data: SoilData;
    region?: (string | null);
    /**
     * Question spécifique pour le système expert
     */
    query?: (string | null);
    /**
     * ID de la parcelle pour stocker la recommandation
     */
    parcelle_id?: (string | null);
};

