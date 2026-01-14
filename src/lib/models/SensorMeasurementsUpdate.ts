/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type SensorMeasurementsUpdate = {
    ph?: (number | null);
    /**
     * Quantité d'azote en kg/ha
     */
    azote?: (number | null);
    /**
     * Quantité de phosphore en kg/ha
     */
    phosphore?: (number | null);
    /**
     * Quantité de potassium en kg/ha
     */
    potassium?: (number | null);
    humidity?: (number | null);
    /**
     * Température en °C
     */
    temperature?: (number | null);
    capteur_id: string;
    timestamp?: (string | null);
    measurements: Record<string, any>;
    parcelle_id: string;
};

