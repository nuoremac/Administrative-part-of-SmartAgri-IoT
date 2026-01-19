/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { UserRole_Output } from './UserRole_Output';
export type UserResponse = {
    id: string;
    nom: string;
    prenom: string;
    email: string;
    telephone: (string | null);
    role: UserRole_Output;
    avatar?: (string | null);
    date_inscription: string;
    dernier_acces?: (string | null);
    created_at: string;
    updated_at: string;
};

