/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { NotificationMode } from './NotificationMode';
import type { RecommendationFrequency } from './RecommendationFrequency';
export type UserUpdate = {
    nom?: (string | null);
    prenom?: (string | null);
    telephone?: (string | null);
    avatar?: (string | null);
    notification_modes?: (Array<NotificationMode> | null);
    recommendation_frequency?: (RecommendationFrequency | null);
};

