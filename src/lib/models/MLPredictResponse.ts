/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Réponse du service ML synchronisée avec l'API Render
 */
export type MLPredictResponse = {
    recommended_crop: string;
    confidence: number;
    total_samples: number;
    features_order: Array<string>;
    all_predictions: Array<string>;
    vote_details: Record<string, number>;
};

