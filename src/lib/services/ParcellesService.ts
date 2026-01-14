/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ParcelleCreate } from '../models/ParcelleCreate';
import type { ParcelleResponse } from '../models/ParcelleResponse';
import type { ParcelleUpdate } from '../models/ParcelleUpdate';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ParcellesService {
    /**
     * Créer une nouvelle parcelle
     * Créer une nouvelle parcelle dans un terrain.
     *
     * - **nom**: Nom de la parcelle (obligatoire)
     * - **terrain_id**: ID du terrain parent (obligatoire)
     * - **superficie**: Superficie en hectares (obligatoire)
     * - **type_sol**: Type de sol
     * - **systeme_irrigation**: Système d'irrigation utilisé
     *
     * La superficie totale des parcelles ne peut pas dépasser celle du terrain.
     * Un code unique sera automatiquement généré si non fourni.
     * @param requestBody
     * @returns ParcelleResponse Successful Response
     * @throws ApiError
     */
    public static createParcelleApiV1ParcellesParcellesPost(
        requestBody: ParcelleCreate,
    ): CancelablePromise<ParcelleResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/parcelles/parcelles/',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Récupérer les parcelles d'un terrain
     * Récupérer toutes les parcelles d'un terrain spécifique.
     * @param terrainId
     * @param skip Nombre d'éléments à ignorer
     * @param limit Nombre maximum d'éléments
     * @returns ParcelleResponse Successful Response
     * @throws ApiError
     */
    public static getParcellesByTerrainApiV1ParcellesParcellesTerrainTerrainIdGet(
        terrainId: string,
        skip?: number,
        limit: number = 100,
    ): CancelablePromise<Array<ParcelleResponse>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/parcelles/parcelles/terrain/{terrain_id}',
            path: {
                'terrain_id': terrainId,
            },
            query: {
                'skip': skip,
                'limit': limit,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Récupérer une parcelle par son code unique
     * Récupérer les détails d'une parcelle en utilisant son code unique (ex: P-001).
     * @param code
     * @returns ParcelleResponse Successful Response
     * @throws ApiError
     */
    public static getParcelleByCodeApiV1ParcellesParcellesCodeCodeGet(
        code: string,
    ): CancelablePromise<ParcelleResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/parcelles/parcelles/code/{code}',
            path: {
                'code': code,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Statistiques des parcelles d'un terrain
     * Obtenir les statistiques des parcelles d'un terrain.
     *
     * Retourne le nombre de parcelles et la superficie totale par statut.
     * @param terrainId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getParcelleStatisticsApiV1ParcellesParcellesTerrainTerrainIdStatisticsGet(
        terrainId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/parcelles/parcelles/terrain/{terrain_id}/statistics',
            path: {
                'terrain_id': terrainId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Récupérer une parcelle par son ID
     * Récupérer les détails d'une parcelle spécifique.
     * @param parcelleId
     * @returns ParcelleResponse Successful Response
     * @throws ApiError
     */
    public static getParcelleApiV1ParcellesParcellesParcelleIdGet(
        parcelleId: string,
    ): CancelablePromise<ParcelleResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/parcelles/parcelles/{parcelle_id}',
            path: {
                'parcelle_id': parcelleId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Mettre à jour une parcelle
     * Mettre à jour les informations d'une parcelle.
     *
     * Seuls les champs fournis seront mis à jour.
     * Si la culture actuelle est modifiée, l'ancienne culture sera archivée.
     * @param parcelleId
     * @param requestBody
     * @returns ParcelleResponse Successful Response
     * @throws ApiError
     */
    public static updateParcelleApiV1ParcellesParcellesParcelleIdPut(
        parcelleId: string,
        requestBody: ParcelleUpdate,
    ): CancelablePromise<ParcelleResponse> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/parcelles/parcelles/{parcelle_id}',
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
    /**
     * Supprimer une parcelle
     * Supprimer une parcelle (suppression logique).
     *
     * La parcelle ne sera pas physiquement supprimée mais marquée comme supprimée.
     * @param parcelleId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static deleteParcelleApiV1ParcellesParcellesParcelleIdDelete(
        parcelleId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/parcelles/parcelles/{parcelle_id}',
            path: {
                'parcelle_id': parcelleId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Historique des cultures d'une parcelle
     * Récupérer l'historique des cultures d'une parcelle.
     *
     * Retourne toutes les cultures qui ont été plantées sur cette parcelle,
     * avec les dates de plantation et de récolte, ainsi que les rendements.
     * @param parcelleId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getHistoriqueCulturesApiV1ParcellesParcellesParcelleIdHistoriqueGet(
        parcelleId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/parcelles/parcelles/{parcelle_id}/historique',
            path: {
                'parcelle_id': parcelleId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
