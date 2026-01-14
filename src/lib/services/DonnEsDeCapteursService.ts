/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { SensorMeasurementsCreate } from '../models/SensorMeasurementsCreate';
import type { SensorMeasurementsResponse } from '../models/SensorMeasurementsResponse';
import type { SensorMeasurementsUpdate } from '../models/SensorMeasurementsUpdate';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class DonnEsDeCapteursService {
    /**
     * Créer une nouvelle mesure de capteur
     * Créer une nouvelle mesure de capteur.
     *
     * - **capteur_id**: ID du capteur (obligatoire)
     * - **parcelle_id**: ID de la parcelle (obligatoire)
     * - **measurements**: Données JSON des mesures (obligatoire)
     * - **ph**, **azote**, **phosphore**, **potassium**, **humidity**, **temperature**: Valeurs optionnelles
     * @param requestBody
     * @returns SensorMeasurementsResponse Successful Response
     * @throws ApiError
     */
    public static createSensorMeasurementApiV1SensorDataSensorDataPost(
        requestBody: SensorMeasurementsCreate,
    ): CancelablePromise<SensorMeasurementsResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/sensor-data/sensor-data/',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Récupérer toutes les mesures
     * Récupérer toutes les mesures de capteurs.
     * @param skip Nombre d'éléments à ignorer
     * @param limit Nombre maximum d'éléments
     * @returns SensorMeasurementsResponse Successful Response
     * @throws ApiError
     */
    public static getAllMeasurementsApiV1SensorDataSensorDataGet(
        skip?: number,
        limit: number = 100,
    ): CancelablePromise<Array<SensorMeasurementsResponse>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/sensor-data/sensor-data/',
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
     * Récupérer les mesures d'un capteur
     * Récupérer toutes les mesures d'un capteur spécifique.
     *
     * Possibilité de filtrer par plage de dates.
     * @param capteurId
     * @param skip Nombre d'éléments à ignorer
     * @param limit Nombre maximum d'éléments
     * @param startDate Date de début
     * @param endDate Date de fin
     * @returns SensorMeasurementsResponse Successful Response
     * @throws ApiError
     */
    public static getMeasurementsByCapteurApiV1SensorDataSensorDataCapteurCapteurIdGet(
        capteurId: string,
        skip?: number,
        limit: number = 100,
        startDate?: (string | null),
        endDate?: (string | null),
    ): CancelablePromise<Array<SensorMeasurementsResponse>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/sensor-data/sensor-data/capteur/{capteur_id}',
            path: {
                'capteur_id': capteurId,
            },
            query: {
                'skip': skip,
                'limit': limit,
                'start_date': startDate,
                'end_date': endDate,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Récupérer les mesures d'une parcelle
     * Récupérer toutes les mesures d'une parcelle.
     *
     * Possibilité de filtrer par plage de dates.
     * @param parcelleId
     * @param skip Nombre d'éléments à ignorer
     * @param limit Nombre maximum d'éléments
     * @param startDate Date de début
     * @param endDate Date de fin
     * @returns SensorMeasurementsResponse Successful Response
     * @throws ApiError
     */
    public static getMeasurementsByParcelleApiV1SensorDataSensorDataParcelleParcelleIdGet(
        parcelleId: string,
        skip?: number,
        limit: number = 100,
        startDate?: (string | null),
        endDate?: (string | null),
    ): CancelablePromise<Array<SensorMeasurementsResponse>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/sensor-data/sensor-data/parcelle/{parcelle_id}',
            path: {
                'parcelle_id': parcelleId,
            },
            query: {
                'skip': skip,
                'limit': limit,
                'start_date': startDate,
                'end_date': endDate,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Récupérer une mesure par son ID
     * Récupérer les détails d'une mesure spécifique.
     * @param measurementId
     * @returns SensorMeasurementsResponse Successful Response
     * @throws ApiError
     */
    public static getMeasurementApiV1SensorDataSensorDataMeasurementIdGet(
        measurementId: string,
    ): CancelablePromise<SensorMeasurementsResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/sensor-data/sensor-data/{measurement_id}',
            path: {
                'measurement_id': measurementId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Mettre à jour une mesure
     * Mettre à jour une mesure de capteur.
     *
     * Seuls les champs fournis seront mis à jour.
     * @param measurementId
     * @param requestBody
     * @returns SensorMeasurementsResponse Successful Response
     * @throws ApiError
     */
    public static updateMeasurementApiV1SensorDataSensorDataMeasurementIdPut(
        measurementId: string,
        requestBody: SensorMeasurementsUpdate,
    ): CancelablePromise<SensorMeasurementsResponse> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/sensor-data/sensor-data/{measurement_id}',
            path: {
                'measurement_id': measurementId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Supprimer une mesure
     * Supprimer une mesure de capteur.
     * @param measurementId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static deleteMeasurementApiV1SensorDataSensorDataMeasurementIdDelete(
        measurementId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/sensor-data/sensor-data/{measurement_id}',
            path: {
                'measurement_id': measurementId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Statistiques d'un capteur
     * Obtenir les statistiques des mesures d'un capteur sur une période donnée.
     *
     * Retourne les moyennes, min et max pour chaque paramètre mesuré.
     * @param capteurId
     * @param days Nombre de jours à analyser
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getCapteurStatisticsApiV1SensorDataSensorDataStatisticsCapteurCapteurIdGet(
        capteurId: string,
        days: number = 7,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/sensor-data/sensor-data/statistics/capteur/{capteur_id}',
            path: {
                'capteur_id': capteurId,
            },
            query: {
                'days': days,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Dernière mesure d'un capteur
     * Récupérer la dernière mesure enregistrée par un capteur.
     * @param capteurId
     * @returns SensorMeasurementsResponse Successful Response
     * @throws ApiError
     */
    public static getLatestMeasurementApiV1SensorDataSensorDataLatestCapteurCapteurIdGet(
        capteurId: string,
    ): CancelablePromise<SensorMeasurementsResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/sensor-data/sensor-data/latest/capteur/{capteur_id}',
            path: {
                'capteur_id': capteurId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
