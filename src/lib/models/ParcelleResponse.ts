/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { StatutParcelle } from './StatutParcelle';
import type { SystemeIrrigation } from './SystemeIrrigation';
import type { TypeSol } from './TypeSol';
export type ParcelleResponse = {
    id: string;
    nom: string;
    code: (string | null);
    description: (string | null);
    terrain_id: string;
    superficie: number;
    type_sol: TypeSol;
    statut: StatutParcelle;
    culture_actuelle: (string | null);
    date_plantation: (string | null);
    date_recolte_estimee: (string | null);
    systeme_irrigation: (SystemeIrrigation | null);
    nombre_capteurs?: (number | null);
    created_at: string;
    updated_at: string;
};

