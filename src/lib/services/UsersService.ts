/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { UserResponse } from '../models/UserResponse';
import type { UserRole_Input } from '../models/UserRole_Input';
import type { UserUpdate } from '../models/UserUpdate';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class UsersService {
    /**
     * Get My Profile
     * Recupere le profil de l'utilisateur connecte
     * @returns UserResponse Successful Response
     * @throws ApiError
     */
    public static getMyProfileApiV1UsersMeGet(): CancelablePromise<UserResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/users/me',
        });
    }
    /**
     * Update My Profile
     * Met a jour le profil de l'utilisateur connecte
     * @param requestBody
     * @returns UserResponse Successful Response
     * @throws ApiError
     */
    public static updateMyProfileApiV1UsersMePut(
        requestBody: UserUpdate,
    ): CancelablePromise<UserResponse> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/users/me',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get All Users
     * Recupere tous les utilisateurs (Admin uniquement)
     * @param skip
     * @param limit
     * @param role
     * @returns UserResponse Successful Response
     * @throws ApiError
     */
    public static getAllUsersApiV1UsersGet(
        skip?: number,
        limit: number = 100,
        role?: (UserRole_Input | null),
    ): CancelablePromise<Array<UserResponse>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/users/',
            query: {
                'skip': skip,
                'limit': limit,
                'role': role,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get User By Id
     * Recupere un utilisateur par son ID (Admin uniquement)
     * @param userId
     * @returns UserResponse Successful Response
     * @throws ApiError
     */
    public static getUserByIdApiV1UsersUserIdGet(
        userId: string,
    ): CancelablePromise<UserResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/users/{user_id}',
            path: {
                'user_id': userId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Update User
     * Met a jour un utilisateur (Admin uniquement)
     * @param userId
     * @param requestBody
     * @returns UserResponse Successful Response
     * @throws ApiError
     */
    public static updateUserApiV1UsersUserIdPut(
        userId: string,
        requestBody: UserUpdate,
    ): CancelablePromise<UserResponse> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/users/{user_id}',
            path: {
                'user_id': userId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Delete User
     * Supprime un utilisateur (Admin uniquement)
     * @param userId
     * @returns void
     * @throws ApiError
     */
    public static deleteUserApiV1UsersUserIdDelete(
        userId: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/users/{user_id}',
            path: {
                'user_id': userId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
