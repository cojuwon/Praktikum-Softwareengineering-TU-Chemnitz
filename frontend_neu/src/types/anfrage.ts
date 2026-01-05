/**
 * TypeScript Typen für das Anfrage-Model.
 * Basiert auf dem Django Backend Model und Serializer.
 */

/**
 * Standort/Ort Choices (STANDORT_CHOICES aus Backend)
 * Key = Backend-Wert, Value = Label für UI
 */
export const STANDORT_CHOICES = {
  'LS': 'Leipzig Stadt',
  'LL': 'Leipzig Land',
  'NS': 'Nordsachsen',
  'S': 'Sachsen (Andere)',
  'D': 'Deutschland (Andere)',
  'A': 'Ausland',
  'K': 'keine Angabe',
} as const;

export type StandortCode = keyof typeof STANDORT_CHOICES;

/**
 * Anfrage Person Choices (ANFRAGE_PERSON_CHOICES aus Backend)
 */
export const ANFRAGE_PERSON_CHOICES = {
  'F': 'Fachkraft',
  'A': 'Angehörige:r',
  'B': 'Betroffene:r',
  'AN': 'anonym',
  'qB': 'queer Betroffene:r',
  'qF': 'queer Fachkraft',
  'qA': 'queer Angehörige:r',
  'qAN': 'queer anonym',
  'FfB': 'Fachkraft für Betroffene',
  'AfB': 'Angehörige:r für Betroffene',
  'FFqB': 'Fachkraft für queere Betroffene',
  'AfqB': 'Angehörige:r für queere Betroffene',
} as const;

export type AnfragePersonCode = keyof typeof ANFRAGE_PERSON_CHOICES;

/**
 * Anfrage Art Choices (ANFRAGE_ART_CHOICES aus Backend)
 */
export const ANFRAGE_ART_CHOICES = {
  'MS': 'medizinische Soforthilfe',
  'VS': 'vertrauliche Spurensicherung',
  'B': 'Beratungsbedarf',
  'R': 'rechtliche Fragen',
  'S': 'Sonstiges',
} as const;

export type AnfrageArtCode = keyof typeof ANFRAGE_ART_CHOICES;

/**
 * Anfrage Interface - repräsentiert eine Anfrage aus dem Backend.
 * 
 * Entspricht dem AnfrageSerializer Output:
 * - anfrage_id: Primary Key
 * - anfrage_weg: Freitext für Anfrageweg
 * - anfrage_datum: ISO Date String
 * - anfrage_ort: StandortCode (z.B. 'LS', 'LL')
 * - anfrage_person: AnfragePersonCode (z.B. 'B', 'F')
 * - anfrage_art: AnfrageArtCode (z.B. 'MS', 'B')
 * - mitarbeiterin: ID der zuständigen Mitarbeiterin (read-only)
 * - mitarbeiterin_display: Name der Mitarbeiterin (read-only)
 * - fall: ID des zugeordneten Falls (optional)
 * - beratungstermin: Nested Beratungstermin-Objekt (optional)
 */
export interface Anfrage {
  anfrage_id: number;
  anfrage_weg: string;
  anfrage_datum: string; // ISO 8601 Date String (z.B. "2024-01-15")
  anfrage_ort: StandortCode;
  anfrage_person: AnfragePersonCode;
  anfrage_art: AnfrageArtCode;
  mitarbeiterin: number | null;
  mitarbeiterin_display: string | null;
  fall: number | null;
  beratungstermin: Beratungstermin | null;
}

/**
 * Beratungstermin (nested in Anfrage)
 */
export interface Beratungstermin {
  termin_id: number;
  termin_datum: string;
  termin_uhrzeit: string;
  beratungsstelle: string;
  beratungsart: string;
}

/**
 * Payload zum Erstellen einer neuen Anfrage
 */
export interface AnfrageCreatePayload {
  anfrage_weg: string;
  anfrage_datum?: string; // Optional, Backend setzt default
  anfrage_ort: StandortCode;
  anfrage_person: AnfragePersonCode;
  anfrage_art: AnfrageArtCode;
  beratungstermin_data?: {
    termin_datum: string;
    termin_uhrzeit: string;
    beratungsstelle: string;
    beratungsart: string;
  };
}

/**
 * API Response für Anfrage-Liste (falls paginiert)
 */
export interface AnfrageListResponse {
  count?: number;
  next?: string | null;
  previous?: string | null;
  results: Anfrage[];
}

/**
 * Hilfsfunktion zum Formatieren des Datums im deutschen Format
 */
export function formatDatum(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/**
 * Hilfsfunktion zum Ermitteln des Labels für einen Standort-Code
 */
export function getStandortLabel(code: StandortCode): string {
  return STANDORT_CHOICES[code] || code;
}

/**
 * Hilfsfunktion zum Ermitteln des Labels für eine Anfrage-Person
 */
export function getAnfragePersonLabel(code: AnfragePersonCode): string {
  return ANFRAGE_PERSON_CHOICES[code] || code;
}

/**
 * Hilfsfunktion zum Ermitteln des Labels für eine Anfrage-Art
 */
export function getAnfrageArtLabel(code: AnfrageArtCode): string {
  return ANFRAGE_ART_CHOICES[code] || code;
}
