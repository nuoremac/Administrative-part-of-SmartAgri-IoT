/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { SystemeIrrigation } from './SystemeIrrigation';
import type { TypeSol } from './TypeSol';
export type ParcelleCreate = {
    nom: string;
    code?: (string | null);
    description?: (string | null);
    terrain_id: string;
    type_sol: TypeSol;
    superficie: number;
    systeme_irrigation?: (SystemeIrrigation | null);
    source_eau?: (string | null);
};

