/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type CapteurCreate = {
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
};

