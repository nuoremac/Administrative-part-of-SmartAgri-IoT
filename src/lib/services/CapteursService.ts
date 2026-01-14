/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Capteur } from '../models/Capteur';
import type { CapteurCreate } from '../models/CapteurCreate';
import type { CapteurUpdate } from '../models/CapteurUpdate';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class CapteursService {
    /**
     * Créer un nouveau capteur
     * Crée un capteur. Nécessite `nom`, `dev_eui`, `parcelle_id` et `date_installation`.
     * @param requestBody
     * @returns Capteur Successful Response
     * @throws ApiError
     */
    public static createCapteurApiV1CapteursPost(
        requestBody: CapteurCreate,
    ): CancelablePromise<Capteur> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/capteurs/',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Lister tous les capteurs
     * Récupère une liste paginée de tous les capteurs.
     * @param skip
     * @param limit
     * @returns Capteur Successful Response
     * @throws ApiError
     */
    public static readCapteursApiV1CapteursGet(
        skip?: number,
        limit: number = 100,
    ): CancelablePromise<Array<Capteur>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/capteurs/',
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
     * Lire un capteur par ID
     * Récupère un capteur spécifique par son UUID.
     * @param capteurId
     * @returns Capteur Successful Response
     * @throws ApiError
     */
    public static readCapteurApiV1CapteursCapteurIdGet(
        capteurId: string,
    ): CancelablePromise<Capteur> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/capteurs/{capteur_id}',
            path: {
                'capteur_id': capteurId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Mettre à jour un capteur existant
     * Met à jour un capteur par son UUID.
     * @param capteurId
     * @param requestBody
     * @returns Capteur Successful Response
     * @throws ApiError
     */
    public static updateCapteurApiV1CapteursCapteurIdPut(
        capteurId: string,
        requestBody: CapteurUpdate,
    ): CancelablePromise<Capteur> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/capteurs/{capteur_id}',
            path: {
                'capteur_id': capteurId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Supprimer un capteur
     * Supprime un capteur par son UUID.
     * @param capteurId
     * @returns Capteur Successful Response
     * @throws ApiError
     */
    public static deleteCapteurApiV1CapteursCapteurIdDelete(
        capteurId: string,
    ): CancelablePromise<Capteur> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/capteurs/{capteur_id}',
            path: {
                'capteur_id': capteurId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Récupérer un capteur par son code
     * Récupère les détails d'un capteur spécifique en utilisant son code unique.
     * @param code
     * @returns Capteur Successful Response
     * @throws ApiError
     */
    public static readCapteurByCodeApiV1CapteursCodeCodeGet(
        code: string,
    ): CancelablePromise<Capteur> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/capteurs/code/{code}',
            path: {
                'code': code,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
