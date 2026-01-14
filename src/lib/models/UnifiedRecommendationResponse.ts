/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ExpertSystemResponse } from './ExpertSystemResponse';
import type { MLPredictResponse } from './MLPredictResponse';
/**
 * Réponse unifiée et agrégée
 */
export type UnifiedRecommendationResponse = {
    recommended_crop: string;
    confidence_score: number;
    justification: string;
    ml_details: MLPredictResponse;
    expert_details?: (ExpertSystemResponse | null);
    generated_at: string;
};

