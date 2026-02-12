/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { NotificationResponse } from '../models/NotificationResponse';
import type { NotificationTestRequest } from '../models/NotificationTestRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class NotificationsService {
    /**
     * Tester l'envoi d'une notification
     * Permet de tester l'envoi d'une notification sur un canal spécifique.
     * Si 'target' n'est pas fourni, utilise les informations du profil de l'utilisateur.
     * @param requestBody
     * @returns NotificationResponse Successful Response
     * @throws ApiError
     */
    public static testNotificationApiV1NotificationsTestPost(
        requestBody: NotificationTestRequest,
    ): CancelablePromise<NotificationResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/notifications/test',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Liste des modes de notification supportés
     * Retourne la liste des canaux de communication disponibles.
     * @returns string Successful Response
     * @throws ApiError
     */
    public static getSupportedModesApiV1NotificationsModesGet(): CancelablePromise<Array<string>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/notifications/modes',
        });
    }
}
