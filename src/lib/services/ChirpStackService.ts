/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ChirpStackService {
    /**
     * Webhook ChirpStack pour les événements (up, join, etc.)
     * Point d'entrée principal pour les webhooks ChirpStack.
     * Dispatche vers la fonction appropriée selon le paramètre 'event'.
     * @param event
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public static handleChirpstackWebhookApiV1ChirpstackChirpstackPost(
        event: string,
        requestBody: Record<string, any>,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/chirpstack/chirpstack/',
            query: {
                'event': event,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
