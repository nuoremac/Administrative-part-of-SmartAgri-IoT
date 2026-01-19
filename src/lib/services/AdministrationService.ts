/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ParcelleResponse } from '../models/ParcelleResponse';
import type { TerrainResponse } from '../models/TerrainResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AdministrationService {
    /**
     * Tableau de bord administrateur
     * Obtenir les statistiques globales du système.
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getAdminDashboardApiV1AdminDashboardGet(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/admin/dashboard',
        });
    }
    /**
     * Lister tous les terrains (Admin)
     * Récupérer tous les terrains de tous les utilisateurs.
     * @param skip
     * @param limit
     * @returns TerrainResponse Successful Response
     * @throws ApiError
     */
    public static getAllTerrainsAdminApiV1AdminTerrainsGet(
        skip?: number,
        limit: number = 100,
    ): CancelablePromise<Array<TerrainResponse>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/admin/terrains',
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
     * Lister toutes les parcelles (Admin)
     * Récupérer toutes les parcelles de tous les utilisateurs.
     * @param skip
     * @param limit
     * @returns ParcelleResponse Successful Response
     * @throws ApiError
     */
    public static getAllParcellesAdminApiV1AdminParcellesGet(
        skip?: number,
        limit: number = 100,
    ): CancelablePromise<Array<ParcelleResponse>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/admin/parcelles',
            query: {
                'skip': skip,
                'limit': limit,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
