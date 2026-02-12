/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { NotificationMode } from './NotificationMode';
import type { RecommendationFrequency } from './RecommendationFrequency';
export type UserCreate = {
    nom: string;
    prenom: string;
    email: string;
    telephone?: (string | null);
    notification_modes?: Array<NotificationMode>;
    recommendation_frequency?: RecommendationFrequency;
    password: string;
};

