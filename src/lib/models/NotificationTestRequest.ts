/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { NotificationMode } from './NotificationMode';
export type NotificationTestRequest = {
    mode: NotificationMode;
    /**
     * Email, téléphone ou chat_id. Si vide, utilise les données de l'utilisateur connecté.
     */
    target?: (string | null);
    message?: string;
};

