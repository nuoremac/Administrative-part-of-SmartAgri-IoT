/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { NotificationMode } from './NotificationMode';
import type { RecommendationFrequency } from './RecommendationFrequency';
import type { UserRole_Output } from './UserRole_Output';
export type UserResponse = {
    id: string;
    nom: string;
    prenom: string;
    email: string;
    telephone: (string | null);
    role: UserRole_Output;
    avatar?: (string | null);
    notification_modes?: Array<NotificationMode>;
    recommendation_frequency: RecommendationFrequency;
    date_inscription: string;
    dernier_acces?: (string | null);
    created_at: string;
    updated_at: string;
};

