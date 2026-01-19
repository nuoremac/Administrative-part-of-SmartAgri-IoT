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
     * Créer un nouveau capteur (Admin uniquement)
     * Crée un capteur. Réservé aux administrateurs.
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
     * Lister tous les capteurs (Admin uniquement)
     * Récupère une liste complète de tous les capteurs. Réservé aux administrateurs.
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
     * Mettre à jour un capteur existant (Admin uniquement)
     * Met à jour un capteur. Réservé aux administrateurs.
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
     * Supprimer un capteur (Admin uniquement)
     * Supprime un capteur. Réservé aux administrateurs.
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
    /**
     * Assigner un capteur à une parcelle
     * Assigne un capteur à une parcelle. Accessible à tous les utilisateurs connectés.
     * @param codeParcelle
     * @param codeCapteur
     * @returns any Successful Response
     * @throws ApiError
     */
    public static assignCapteurApiV1CapteursAssignPost(
        codeParcelle: string,
        codeCapteur: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/capteurs/assign',
            query: {
                'code_parcelle': codeParcelle,
                'code_capteur': codeCapteur,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Désassigner un capteur d'une parcelle
     * Désassigne un capteur d'une parcelle. Accessible à tous les utilisateurs connectés.
     * @param codeParcelle
     * @param codeCapteur
     * @returns any Successful Response
     * @throws ApiError
     */
    public static desassignCapteurApiV1CapteursDesassignPost(
        codeParcelle: string,
        codeCapteur: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/capteurs/desassign',
            query: {
                'code_parcelle': codeParcelle,
                'code_capteur': codeCapteur,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
