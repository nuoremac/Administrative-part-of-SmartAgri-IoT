/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ClimateZone } from '../models/ClimateZone';
import type { Continent } from '../models/Continent';
import type { LocaliteCreate } from '../models/LocaliteCreate';
import type { LocaliteResponse } from '../models/LocaliteResponse';
import type { LocaliteUpdate } from '../models/LocaliteUpdate';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class LocalitSService {
    /**
     * Créer une nouvelle localité
     * Créer une nouvelle localité avec ses coordonnées GPS et informations climatiques.
     *
     * **Coordonnées :**
     * - **latitude**: -90 à 90
     * - **longitude**: -180 à 180
     * - **altitude**: Altitude en mètres (optionnel)
     *
     * **Adresse :**
     * - **ville**: Nom de la ville (obligatoire)
     * - **pays**: Nom du pays (obligatoire)
     * - **continent**: Continent (obligatoire)
     * - **quartier**, **region**, **code_postal**: Optionnels
     *
     * **Informations supplémentaires :**
     * - **timezone**: Fuseau horaire (ex: "Africa/Douala")
     * - **superficie**: Superficie en km²
     * - **climate_zone**: Zone climatique
     * @param requestBody
     * @returns LocaliteResponse Successful Response
     * @throws ApiError
     */
    public static createLocaliteApiV1LocalitesLocalitesPost(
        requestBody: LocaliteCreate,
    ): CancelablePromise<LocaliteResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/localites/localites/',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Récupérer toutes les localités
     * Récupérer toutes les localités avec possibilité de filtrage.
     *
     * **Filtres disponibles :**
     * - **continent**: Filtrer par continent
     * - **climate_zone**: Filtrer par zone climatique
     * - **pays**: Recherche partielle dans le nom du pays
     * - **ville**: Recherche partielle dans le nom de la ville
     * - **search**: Recherche globale dans nom, ville, pays et région
     *
     * **Pagination :**
     * - **skip**: Nombre d'éléments à ignorer
     * - **limit**: Nombre maximum d'éléments à retourner (max 1000)
     * @param skip Nombre d'éléments à ignorer
     * @param limit Nombre maximum d'éléments
     * @param continent Filtrer par continent
     * @param climateZone Filtrer par zone climatique
     * @param pays Filtrer par pays
     * @param ville Filtrer par ville
     * @param search Recherche globale (nom, ville, pays, région)
     * @returns LocaliteResponse Successful Response
     * @throws ApiError
     */
    public static getAllLocalitesApiV1LocalitesLocalitesGet(
        skip?: number,
        limit: number = 100,
        continent?: (Continent | null),
        climateZone?: (ClimateZone | null),
        pays?: (string | null),
        ville?: (string | null),
        search?: (string | null),
    ): CancelablePromise<Array<LocaliteResponse>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/localites/localites/',
            query: {
                'skip': skip,
                'limit': limit,
                'continent': continent,
                'climate_zone': climateZone,
                'pays': pays,
                'ville': ville,
                'search': search,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Statistiques des localités
     * Obtenir les statistiques globales des localités.
     *
     * Retourne :
     * - Nombre total de localités
     * - Répartition par continent
     * - Répartition par zone climatique
     * - Superficie totale couverte
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getLocaliteStatisticsApiV1LocalitesLocalitesStatisticsGet(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/localites/localites/statistics',
        });
    }
    /**
     * Liste des pays disponibles
     * Obtenir la liste de tous les pays avec le nombre de localités par pays.
     *
     * Utile pour remplir des listes déroulantes ou filtres.
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getCountriesListApiV1LocalitesLocalitesCountriesGet(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/localites/localites/countries',
        });
    }
    /**
     * Localités à proximité
     * Trouver les localités dans un rayon donné autour d'un point GPS.
     *
     * Utilise la formule de Haversine pour calculer les distances précises.
     * Les résultats sont triés par distance croissante.
     *
     * **Paramètres :**
     * - **latitude**: Latitude du point central (-90 à 90)
     * - **longitude**: Longitude du point central (-180 à 180)
     * - **radius_km**: Rayon de recherche en kilomètres (1 à 500)
     *
     * **Exemple :**
     * Pour trouver les localités à 30km de Yaoundé (3.8667°N, 11.5167°E):
     * `/localites/proximity?latitude=3.8667&longitude=11.5167&radius_km=30`
     * @param latitude Latitude du point de référence
     * @param longitude Longitude du point de référence
     * @param radiusKm Rayon de recherche en km
     * @returns LocaliteResponse Successful Response
     * @throws ApiError
     */
    public static getLocalitesByProximityApiV1LocalitesLocalitesProximityGet(
        latitude: number,
        longitude: number,
        radiusKm: number = 50,
    ): CancelablePromise<Array<LocaliteResponse>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/localites/localites/proximity',
            query: {
                'latitude': latitude,
                'longitude': longitude,
                'radius_km': radiusKm,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Localités par pays
     * Récupérer toutes les localités d'un pays spécifique.
     *
     * Les résultats sont triés par nom de ville.
     * @param pays
     * @returns LocaliteResponse Successful Response
     * @throws ApiError
     */
    public static getLocalitesByCountryApiV1LocalitesLocalitesCountryPaysGet(
        pays: string,
    ): CancelablePromise<Array<LocaliteResponse>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/localites/localites/country/{pays}',
            path: {
                'pays': pays,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Récupérer une localité par son ID
     * Récupérer les détails complets d'une localité spécifique.
     * @param localiteId
     * @returns LocaliteResponse Successful Response
     * @throws ApiError
     */
    public static getLocaliteApiV1LocalitesLocalitesLocaliteIdGet(
        localiteId: string,
    ): CancelablePromise<LocaliteResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/localites/localites/{localite_id}',
            path: {
                'localite_id': localiteId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Mettre à jour une localité
     * Mettre à jour les informations d'une localité.
     *
     * Seuls les champs fournis seront mis à jour.
     * Les coordonnées GPS ne peuvent pas être modifiées après création.
     * @param localiteId
     * @param requestBody
     * @returns LocaliteResponse Successful Response
     * @throws ApiError
     */
    public static updateLocaliteApiV1LocalitesLocalitesLocaliteIdPut(
        localiteId: string,
        requestBody: LocaliteUpdate,
    ): CancelablePromise<LocaliteResponse> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/localites/localites/{localite_id}',
            path: {
                'localite_id': localiteId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Supprimer une localité
     * Supprimer une localité (suppression logique).
     *
     * La suppression échouera si des terrains sont associés à cette localité.
     * Vous devez d'abord supprimer ou réassigner les terrains.
     * @param localiteId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static deleteLocaliteApiV1LocalitesLocalitesLocaliteIdDelete(
        localiteId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/localites/localites/{localite_id}',
            path: {
                'localite_id': localiteId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
