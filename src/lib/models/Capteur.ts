/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Schéma complet pour la réponse.
 * On force l'ID en str pour accepter les UUID de la base de données.
 */
export type Capteur = {
    nom: string;
    /**
     * DevEUI LoRaWAN (16 caractères hexadécimaux)
     */
    dev_eui: string;
    /**
     * UUID de la Parcelle associée
     */
    parcelle_id?: (string | null);
    /**
     *  code de reference associée
     */
    code: string;
    date_installation: string;
    date_activation?: (string | null);
    id: string;
    created_at: string;
    updated_at: string;
};

