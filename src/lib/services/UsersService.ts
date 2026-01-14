/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { UserResponse } from '../models/UserResponse';
import type { UserRole } from '../models/UserRole';
import type { UserStatus } from '../models/UserStatus';
import type { UserUpdate } from '../models/UserUpdate';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class UsersService {
    /**
     * Get My Profile
     * R�cup�re le profil de l'utilisateur connecte
     *
     * Args:
     * current_user: L'utilisateur actuel
     *
     * Returns:
     * UserResponse: Profil de l'utilisateur
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
     * Met � jour le profil de l'utilisateur connect�
     *
     * Args:
     * user_data: Donn�es de mise � jour
     * current_user: L'utilisateur actuel
     * db: Session de base de donn�es
     *
     * Returns:
     * UserResponse: Profil mis � jour
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
     * R�cup�re tous les utilisateurs (Admin uniquement)
     *
     * Args:
     * skip: Nombre d'utilisateurs � sauter
     * limit: Nombre maximum d'utilisateurs � retourner
     * status: Filtre par statut
     * role: Filtre par r�le
     * current_user: L'utilisateur actuel (doit �tre admin)
     * db: Session de base de donn�es
     *
     * Returns:
     * List[UserResponse]: Liste des utilisateurs
     * @param skip
     * @param limit
     * @param status
     * @param role
     * @returns UserResponse Successful Response
     * @throws ApiError
     */
    public static getAllUsersApiV1UsersGet(
        skip?: number,
        limit: number = 100,
        status?: (UserStatus | null),
        role?: (UserRole | null),
    ): CancelablePromise<Array<UserResponse>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/users/',
            query: {
                'skip': skip,
                'limit': limit,
                'status': status,
                'role': role,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get User By Id
     * R�cup�re un utilisateur par son ID (Admin uniquement)
     *
     * Args:
     * user_id: ID de l'utilisateur
     * current_user: L'utilisateur actuel (doit �tre admin)
     * db: Session de base de donn�es
     *
     * Returns:
     * UserResponse: L'utilisateur
     *
     * Raises:
     * HTTPException: Si l'utilisateur n'existe pas
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
     * Met � jour un utilisateur (Admin uniquement)
     *
     * Args:
     * user_id: ID de l'utilisateur
     * user_data: Donn�es de mise � jour
     * current_user: L'utilisateur actuel (doit �tre admin)
     * db: Session de base de donn�es
     *
     * Returns:
     * UserResponse: Utilisateur mis � jour
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
     *
     * Args:
     * user_id: ID de l'utilisateur
     * current_user: L'utilisateur actuel (doit �tre admin)
     * db: Session de base de donn�es
     *
     * Returns:
     * Statut 204 No Content
     *
     * Raises:
     * HTTPException: Si l'utilisateur tente de se supprimer lui-m�me
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
    /**
     * Change User Status
     * Change le statut d'un utilisateur (Admin uniquement)
     *
     * Args:
     * user_id: ID de l'utilisateur
     * new_status: Nouveau statut
     * current_user: L'utilisateur actuel (doit �tre admin)
     * db: Session de base de donn�es
     *
     * Returns:
     * UserResponse: Utilisateur avec le statut mis � jour
     *
     * Raises:
     * HTTPException: Si l'utilisateur tente de changer son propre statut
     * @param userId
     * @param newStatus
     * @returns UserResponse Successful Response
     * @throws ApiError
     */
    public static changeUserStatusApiV1UsersUserIdStatusPatch(
        userId: string,
        newStatus: UserStatus,
    ): CancelablePromise<UserResponse> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/v1/users/{user_id}/status',
            path: {
                'user_id': userId,
            },
            query: {
                'new_status': newStatus,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Activate User
     * Active un utilisateur (Admin uniquement)
     *
     * Args:
     * user_id: ID de l'utilisateur
     * current_user: L'utilisateur actuel (doit �tre admin)
     * db: Session de base de donn�es
     *
     * Returns:
     * UserResponse: Utilisateur activ�
     * @param userId
     * @returns UserResponse Successful Response
     * @throws ApiError
     */
    public static activateUserApiV1UsersUserIdActivatePatch(
        userId: string,
    ): CancelablePromise<UserResponse> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/v1/users/{user_id}/activate',
            path: {
                'user_id': userId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Suspend User
     * Suspend un utilisateur (Admin uniquement)
     *
     * Args:
     * user_id: ID de l'utilisateur
     * current_user: L'utilisateur actuel (doit �tre admin)
     * db: Session de base de donn�es
     *
     * Returns:
     * UserResponse: Utilisateur suspendu
     *
     * Raises:
     * HTTPException: Si l'utilisateur tente de se suspendre lui-m�me
     * @param userId
     * @returns UserResponse Successful Response
     * @throws ApiError
     */
    public static suspendUserApiV1UsersUserIdSuspendPatch(
        userId: string,
    ): CancelablePromise<UserResponse> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/v1/users/{user_id}/suspend',
            path: {
                'user_id': userId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
