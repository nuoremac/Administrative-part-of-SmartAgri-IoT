/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Schéma pour la réponse de validation du token
 */
export type TokenValidationResponse = {
    valid: boolean;
    user_id?: (string | null);
    email?: (string | null);
    role?: (string | null);
    expires_at?: (string | null);
    issued_at?: (string | null);
};

