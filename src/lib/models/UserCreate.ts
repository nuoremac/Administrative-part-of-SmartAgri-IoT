/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { UserPreferences } from './UserPreferences';
import type { UserRole } from './UserRole';
export type UserCreate = {
    nom: string;
    prenom: string;
    email: string;
    telephone?: (string | null);
    role?: UserRole;
    preferences?: (UserPreferences | null);
    password: string;
};

