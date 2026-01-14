/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { StatutTerrain } from '../models/StatutTerrain';
import type { TerrainCreate } from '../models/TerrainCreate';
import type { TerrainResponse } from '../models/TerrainResponse';
import type { TerrainUpdate } from '../models/TerrainUpdate';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class TerrainsService {
    /**
     * Créer un nouveau terrain
     * Créer un nouveau terrain agricole.
     *
     * - **nom**: Nom du terrain (obligatoire)
     * - **type_terrain**: Type de terrain (agricole, pastoral, mixte, experimental)
     * - **localite_id**: ID de la localité
     * - **superficie_totale**: Superficie en hectares
     * - **latitude**: Latitude GPS
     * - **longitude**: Longitude GPS
     * @param requestBody
     * @returns TerrainResponse Successful Response
     * @throws ApiError
     */
    public static createTerrainApiV1TerrainsTerrainsPost(
        requestBody: TerrainCreate,
    ): CancelablePromise<TerrainResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/terrains/terrains/',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Récupérer tous les terrains
     * Récupérer tous les terrains de l'utilisateur connecté.
     *
     * Possibilité de filtrer par statut et paginer les résultats.
     * @param skip Nombre d'éléments à ignorer
     * @param limit Nombre maximum d'éléments
     * @param statut Filtrer par statut
     * @returns TerrainResponse Successful Response
     * @throws ApiError
     */
    public static getAllTerrainsApiV1TerrainsTerrainsGet(
        skip?: number,
        limit: number = 100,
        statut?: (StatutTerrain | null),
    ): CancelablePromise<Array<TerrainResponse>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/terrains/terrains/',
            query: {
                'skip': skip,
                'limit': limit,
                'statut': statut,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Statistiques des terrains
     * Obtenir les statistiques des terrains de l'utilisateur.
     *
     * Retourne le nombre de terrains et la superficie totale par statut.
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getTerrainStatisticsApiV1TerrainsTerrainsStatisticsGet(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/terrains/terrains/statistics',
        });
    }
    /**
     * Récupérer un terrain par son ID
     * Récupérer les détails d'un terrain spécifique.
     * @param terrainId
     * @returns TerrainResponse Successful Response
     * @throws ApiError
     */
    public static getTerrainApiV1TerrainsTerrainsTerrainIdGet(
        terrainId: string,
    ): CancelablePromise<TerrainResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/terrains/terrains/{terrain_id}',
            path: {
                'terrain_id': terrainId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Mettre à jour un terrain
     * Mettre à jour les informations d'un terrain.
     *
     * Seuls les champs fournis seront mis à jour.
     * @param terrainId
     * @param requestBody
     * @returns TerrainResponse Successful Response
     * @throws ApiError
     */
    public static updateTerrainApiV1TerrainsTerrainsTerrainIdPut(
        terrainId: string,
        requestBody: TerrainUpdate,
    ): CancelablePromise<TerrainResponse> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/terrains/terrains/{terrain_id}',
            path: {
                'terrain_id': terrainId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Supprimer un terrain
     * Supprimer un terrain (suppression logique).
     *
     * Le terrain ne sera pas physiquement supprimé mais marqué comme supprimé.
     * @param terrainId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static deleteTerrainApiV1TerrainsTerrainsTerrainIdDelete(
        terrainId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/terrains/terrains/{terrain_id}',
            path: {
                'terrain_id': terrainId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
