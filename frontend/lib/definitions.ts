// This file contains type definitions for your data.
// It describes the shape of the data, and what data type each property should accept.
// For simplicity of teaching, we're manually defining these types.
// However, these types are generated automatically if you're using an ORM such as Prisma.

import { EnumDeclaration } from "typescript";

export enum AnfrageOrt {
  LeipzigStadt = 'Leipzig Stadt',
  LeipzigLand = 'Leipzig Land',
  Nordsachsen = 'Nordsachsen',
  Sachsen = 'Sachsen',
  Andere = 'Andere',
};

export enum AnfragePerson {
  Fachkraft = 'F',
  Angehoerige = 'A',
  Betroffene = 'B',
};

export enum AnfrageArt {
  MedizinischeSoforthilfe = 'medizinische Soforthilfe',
  VertraulicheSpurensicherung = 'vertrauliche Spurensicherung',
  Beratungsbedarf = 'Beratungsbedarf',
  RechtlicheFragen = 'rechtliche Fragen',
  Sonstiges = 'Sonstiges',
};

export interface Anfrage {
  anfrage_id: number;                     // eindeutige ID der Anfrage
  anfrage_weg: string;            // Beschreibung, wie die Anfrage erfolgt ist
  anfrage_datum: Date;            // Datum der Anfrage
  anfrage_ort: AnfrageOrt;        // Ort der Anfrage
  anfrage_person: AnfragePerson;  // Wer hat angefragt
  anfrage_art: AnfrageArt;        // Art der Anfrage
  beratungs_id: number;          // Optional, wenn Termin vereinbart
  user_id: number;                // Mitarbeiter:in, der die Anfrage zugewiesen bekommen hat
};

export enum RolleMb {
  Admin = 'Admin',
  Erweiterung = 'Erweiterung',
  Basis = 'Basis',
};

export type Konto = {
  user_id: number;
  vorname_mb: string;
  nachname_mb: string;
  mail_mb: string;
  rolle_mb: RolleMb;
  preset_ids: number;
  anfragen_ids: number;
  fall_ids: number;
  password: string;
};

export enum Beratungsstelle {
  StadtLeipzig = 'Fachberatungsstelle für queere Betroffene von sexualisierter Gewalt in der Stadt Leipzig',
  KreisLeipzig = 'Fachberatung gegen sexualisierte Gewalt im Landkreis Leipzig',
  Nordsachsen = 'Fachberatung gegen sexualisierte Gewalt im Landkreis Nordsachsen',
}

export enum Beratungsart {
  persönlich = 'persönlich',
  video = 'video',
  telefon = 'telefon',
  aufsuchend = 'aufsuchend',
  schriftlich = 'schriftlich',
}

export type Beratungstermin = {
  beratungs_id: number;
  beratungsstelle: Beratungsstelle;
  anzahl_beratungen: number;
  termin_beratung: Date;
  beratungsart: Beratungsart;
  notizen_beratung: string;
}

export type Fall = {
  fall_id: number;
  klient_id: number;
  beratungs_id: number;
  tat_id: number;
  begleitungs_id: number;
  user_id: number;
}

// Klient_in fehlt
// Begleitung fehlt

export type Statistik = {
  statistik_id: number;
  statistik_titel: string;
  statistik_notizen: string;
  preset_id: number;
  zeitraum_start: Date;
  zeitraum_ende: Date;
  Ergebnis: File;
  creator_id: number;
  creation_date: Date;
};






