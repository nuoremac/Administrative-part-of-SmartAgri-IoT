import type { LocaliteResponse } from "@/lib/models/LocaliteResponse";
import { ClimateZone } from "@/lib/models/ClimateZone";

export const CAMEROON_COUNTRY = "Cameroon";

export const CAMEROON_CITIES_SUGGESTIONS = [
  "Yaoundé",
  "Douala",
  "Bamenda",
  "Bafoussam",
  "Garoua",
  "Maroua",
  "Ngaoundéré",
  "Bertoua",
  "Ebolowa",
  "Kribi",
  "Limbé",
  "Buea",
  "Kumba",
  "Dschang",
  "Foumban",
  "Nkongsamba",
  "Edéa",
  "Mbalmayo",
  "Sangmélima",
  "Guider",
] as const;

export const CAMEROON_CLIMATE_ZONES: Array<{ value: ClimateZone; labelKey: string }> = [
  { value: ClimateZone.TROPICAL, labelKey: "climate_zone_cm_equatorial" },
  { value: ClimateZone.SUBTROPICAL, labelKey: "climate_zone_cm_highland" },
  { value: ClimateZone.SEMI_ARID, labelKey: "climate_zone_cm_sudano_sahelian" },
  { value: ClimateZone.ARID, labelKey: "climate_zone_cm_sahelian" },
];

const CAMEROON_CLIMATE_ZONE_LABEL_BY_VALUE = new Map<ClimateZone, string>(
  CAMEROON_CLIMATE_ZONES.map((option) => [option.value, option.labelKey])
);

const CAMEROON_COUNTRY_ALIASES = new Set(["cameroon", "cameroun", "cm", "cmr"]);

const normalizeText = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();

export function isCameroonCountry(value: string | null | undefined): boolean {
  if (!value) return false;
  return CAMEROON_COUNTRY_ALIASES.has(normalizeText(value));
}

export function filterCameroonLocalities(localities: LocaliteResponse[]): LocaliteResponse[] {
  return localities.filter((locality) => isCameroonCountry(locality.pays));
}

export function getCameroonClimateZoneLabelKey(value: ClimateZone | null | undefined): string {
  if (!value) return "climate_zone_cm_unknown";
  return CAMEROON_CLIMATE_ZONE_LABEL_BY_VALUE.get(value) ?? "climate_zone_cm_unknown";
}

export function isCameroonClimateZone(value: ClimateZone | null | undefined): value is ClimateZone {
  if (!value) return false;
  return CAMEROON_CLIMATE_ZONE_LABEL_BY_VALUE.has(value);
}
