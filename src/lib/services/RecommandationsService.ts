/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ParcellePredictionRequest } from '../models/ParcellePredictionRequest';
import type { RecommendationResponse } from '../models/RecommendationResponse';
import type { UnifiedRecommendationRequest } from '../models/UnifiedRecommendationRequest';
import type { UnifiedRecommendationResponse } from '../models/UnifiedRecommendationResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class RecommandationsService {
    /**
     * Récupérer l'historique des recommandations
     * Récupérer l'historique de toutes les recommandations de l'utilisateur connecté.
     * @param skip Nombre d'éléments à ignorer
     * @param limit Nombre maximum d'éléments
     * @param priorite Filtrer par priorité
     * @returns RecommendationResponse Successful Response
     * @throws ApiError
     */
    public static getAllRecommendationsApiV1RecommendationsGet(
        skip?: number,
        limit: number = 100,
        priorite?: (string | null),
    ): CancelablePromise<Array<RecommendationResponse>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/recommendations/',
            query: {
                'skip': skip,
                'limit': limit,
                'priorite': priorite,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Récupérer l'historique par parcelle
     * Récupérer l'historique des recommandations d'une parcelle spécifique.
     * @param parcelleId
     * @param skip Nombre d'éléments à ignorer
     * @param limit Nombre maximum d'éléments
     * @param priorite Filtrer par priorité
     * @returns RecommendationResponse Successful Response
     * @throws ApiError
     */
    public static getRecommendationsByParcelleApiV1RecommendationsParcelleParcelleIdGet(
        parcelleId: string,
        skip?: number,
        limit: number = 100,
        priorite?: (string | null),
    ): CancelablePromise<Array<RecommendationResponse>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/recommendations/parcelle/{parcelle_id}',
            path: {
                'parcelle_id': parcelleId,
            },
            query: {
                'skip': skip,
                'limit': limit,
                'priorite': priorite,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Détails d'une recommandation
     * Récupérer les détails d'une recommandation archivée.
     * @param recommendationId
     * @returns RecommendationResponse Successful Response
     * @throws ApiError
     */
    public static getRecommendationApiV1RecommendationsRecommendationIdGet(
        recommendationId: string,
    ): CancelablePromise<RecommendationResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/recommendations/{recommendation_id}',
            path: {
                'recommendation_id': recommendationId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Recommandation de culture (ML + Système Expert)
     * Endpoint chef d'orchestre qui :
     * 1. Appelle le service de Machine Learning pour prédire la culture idéale.
     * 2. Utilise le Système Expert pour justifier et donner des conseils sur cette culture.
     * 3. Agrège les résultats pour le frontend.
     * @param requestBody
     * @returns UnifiedRecommendationResponse Successful Response
     * @throws ApiError
     */
    public static predictCropUnifiedApiV1RecommendationsPredictCropPost(
        requestBody: UnifiedRecommendationRequest,
    ): CancelablePromise<UnifiedRecommendationResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/recommendations/predict-crop',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Prédire la culture pour une parcelle (utilise les dernières mesures)
     * Prédit la culture optimale pour une parcelle spécifique en utilisant ses dernières mesures de capteurs.
     * Si des données sont fournies dans le body, elles surchargent celles de la base de données (optionnel).
     * @param parcelleId
     * @param requestBody
     * @returns UnifiedRecommendationResponse Successful Response
     * @throws ApiError
     */
    public static predictParcelleCropApiV1RecommendationsParcelleParcelleIdPredictCropPost(
        parcelleId: string,
        requestBody?: (ParcellePredictionRequest | null),
    ): CancelablePromise<UnifiedRecommendationResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/recommendations/parcelle/{parcelle_id}/predict-crop',
            path: {
                'parcelle_id': parcelleId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
