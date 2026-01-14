/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { UserPreferences } from './UserPreferences';
import type { UserRole } from './UserRole';
import type { UserStatus } from './UserStatus';
export type UserResponse = {
    nom: string;
    prenom: string;
    email: string;
    telephone?: (string | null);
    role?: UserRole;
    preferences?: (UserPreferences | null);
    id: string;
    status: UserStatus;
    avatar?: (string | null);
    date_inscription: string;
    dernier_acces?: (string | null);
    created_at: string;
    updated_at: string;
};

