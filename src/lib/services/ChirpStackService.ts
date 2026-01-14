/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ChirpStackService {
    /**
     * Traiter une chaîne de segments concaténés
     * Endpoint unique pour traiter le contenu brut.
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public static processRawSensorDataApiV1ChirpstackChirpstackPost(
        requestBody: Record<string, string>,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/chirpstack/chirpstack/',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
