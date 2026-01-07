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
 * Anfrage Herkunft Choices (woher kommt die Anfrage)
 * Spezifische Auswahl für "Anfrage aus" gemäß Anforderung
 */
export const ANFRAGE_HERKUNFT_CHOICES = {
  'LS': 'Leipzig Stadt',
  'LL': 'Leipzig Land',
  'NS': 'Nordsachsen',
  'S': 'Sachsen',
  'A': 'andere',
} as const;

export type AnfrageHerkunftCode = keyof typeof ANFRAGE_HERKUNFT_CHOICES;

/**
 * Termin Ort Choices (Ort des Beratungstermins)
 * Begrenzte Auswahl für Terminort gemäß Anforderung
 */
export const TERMIN_ORT_CHOICES = {
  'LS': 'Leipzig Stadt',
  'LL': 'Leipzig Land',
  'NS': 'Nordsachsen',
} as const;

export type TerminOrtCode = keyof typeof TERMIN_ORT_CHOICES;

/**
 * Beratungsart Choices (Art des Termins)
 */
export const BERATUNGSART_CHOICES = {
  'P': 'persönlich',
  'V': 'Video',
  'T': 'Telefon',
  'A': 'aufsuchend',
  'S': 'schriftlich',
} as const;

export type BeratungsartCode = keyof typeof BERATUNGSART_CHOICES;

/**
 * Anfrageweg Choices (Wie kam die Anfrage rein)
 */
export const ANFRAGE_WEG_CHOICES = {
  'T': 'Telefon',
  'E': 'E-Mail',
  'P': 'Persönlich',
  'S': 'Sonstiges',
} as const;

export type AnfrageWegCode = keyof typeof ANFRAGE_WEG_CHOICES;

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
 * Beratungsstelle Choices für Termin
 */
export const BERATUNGSSTELLE_CHOICES = {
  'LS': 'Fachberatung Leipzig Stadt',
  'NS': 'Nordsachsen',
  'LL': 'Landkreis Leipzig',
} as const;

export type BeratungsstelleCode = keyof typeof BERATUNGSSTELLE_CHOICES;

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
    termin_beratung: string; // Datum des Termins
    termin_uhrzeit?: string;
    beratungsstelle: BeratungsstelleCode; // Ort des Termins
    beratungsart?: string;
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

/**
 * Hilfsfunktion zum Ermitteln des Labels für einen Anfrageweg
 */
export function getAnfrageWegLabel(code: AnfrageWegCode): string {
  return ANFRAGE_WEG_CHOICES[code] || code;
}

/**
 * Hilfsfunktion zum Ermitteln des Labels für eine Anfrage-Herkunft
 */
export function getAnfrageHerkunftLabel(code: AnfrageHerkunftCode): string {
  return ANFRAGE_HERKUNFT_CHOICES[code] || code;
}

/**
 * Hilfsfunktion zum Ermitteln des Labels für eine Beratungsstelle
 */
export function getBeratungsstelleLabel(code: BeratungsstelleCode): string {
  return BERATUNGSSTELLE_CHOICES[code] || code;
}

/**
 * Berechnet die Wartezeit in Tagen zwischen zwei Datumsangaben
 */
export function berechneWartezeit(anfrageDatum: string, terminDatum: string): number {
  const anfrage = new Date(anfrageDatum);
  const termin = new Date(terminDatum);
  const diffTime = termin.getTime() - anfrage.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}
