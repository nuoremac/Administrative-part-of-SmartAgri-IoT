/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { LoginRequest } from '../models/LoginRequest';
import type { PasswordChangeRequest } from '../models/PasswordChangeRequest';
import type { RefreshTokenRequest } from '../models/RefreshTokenRequest';
import type { TokenResponse } from '../models/TokenResponse';
import type { TokenValidationRequest } from '../models/TokenValidationRequest';
import type { TokenValidationResponse } from '../models/TokenValidationResponse';
import type { UserCreate } from '../models/UserCreate';
import type { UserResponse } from '../models/UserResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AuthenticationService {
    /**
     * Register
     * Inscription d'un nouvel utilisateur
     *
     * Args:
     * user_data: Données de l'utilisateur à créer
     * db: Session de base de données
     *
     * Returns:
     * UserResponse: L'utilisateur créé
     *
     * Raises:
     * HTTPException: Si l'email existe déjà
     * @param requestBody
     * @returns UserResponse Successful Response
     * @throws ApiError
     */
    public static registerApiV1AuthRegisterPost(
        requestBody: UserCreate,
    ): CancelablePromise<UserResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/auth/register',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Login
     * Connexion d'un utilisateur
     *
     * Args:
     * login_data: Email et mot de passe
     * db: Session de base de données
     *
     * Returns:
     * TokenResponse: Tokens d'accès et de rafraîchissement
     *
     * Raises:
     * HTTPException: Si les identifiants sont incorrects
     * @param requestBody
     * @returns TokenResponse Successful Response
     * @throws ApiError
     */
    public static loginApiV1AuthLoginPost(
        requestBody: LoginRequest,
    ): CancelablePromise<TokenResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/auth/login',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Refresh Token
     * Rafraîchit le token d'accès
     *
     * Args:
     * refresh_data: Token de rafraîchissement
     * db: Session de base de données
     *
     * Returns:
     * TokenResponse: Nouveaux tokens
     *
     * Raises:
     * HTTPException: Si le token de rafraîchissement est invalide
     * @param requestBody
     * @returns TokenResponse Successful Response
     * @throws ApiError
     */
    public static refreshTokenApiV1AuthRefreshPost(
        requestBody: RefreshTokenRequest,
    ): CancelablePromise<TokenResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/auth/refresh',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Logout
     * Déconnexion de l'utilisateur
     *
     * Note: Côté client, supprimez les tokens du stockage local
     * Dans une implémentation complète, on pourrait ajouter le token à une blacklist
     *
     * Args:
     * current_user: L'utilisateur actuel
     *
     * Returns:
     * Statut 204 No Content
     * @returns void
     * @throws ApiError
     */
    public static logoutApiV1AuthLogoutPost(): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/auth/logout',
        });
    }
    /**
     * Get Current User Info
     * Récupère les informations de l'utilisateur connecté
     *
     * Args:
     * current_user: L'utilisateur actuel
     *
     * Returns:
     * UserResponse: Informations de l'utilisateur
     * @returns UserResponse Successful Response
     * @throws ApiError
     */
    public static getCurrentUserInfoApiV1AuthMeGet(): CancelablePromise<UserResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/auth/me',
        });
    }
    /**
     * Change Password
     * Change le mot de passe de l'utilisateur connecté
     *
     * Args:
     * password_data: Ancien et nouveau mot de passe
     * current_user: L'utilisateur actuel
     * db: Session de base de données
     *
     * Returns:
     * Message de confirmation
     *
     * Raises:
     * HTTPException: Si l'ancien mot de passe est incorrect
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public static changePasswordApiV1AuthChangePasswordPost(
        requestBody: PasswordChangeRequest,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/auth/change-password',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Verify Token Endpoint
     * Vérifie la validité du token d'accès
     *
     * Args:
     * current_user: L'utilisateur actuel (récupéré via le token)
     *
     * Returns:
     * TokenValidationResponse: Informations sur la validité du token
     * @returns TokenValidationResponse Successful Response
     * @throws ApiError
     */
    public static verifyTokenEndpointApiV1AuthVerifyTokenPost(): CancelablePromise<TokenValidationResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/auth/verify-token',
        });
    }
    /**
     * Validate Token
     * Valide un token sans utiliser les headers d'authentification
     *
     * Args:
     * request: La requête contenant le token à valider
     * db: Session de base de données
     *
     * Returns:
     * TokenValidationResponse: Informations sur la validité du token
     * @param requestBody
     * @returns TokenValidationResponse Successful Response
     * @throws ApiError
     */
    public static validateTokenApiV1AuthValidateTokenPost(
        requestBody: TokenValidationRequest,
    ): CancelablePromise<TokenValidationResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/auth/validate-token',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
