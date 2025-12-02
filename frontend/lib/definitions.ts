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
  F = 'Fachkraft',
  A = 'Aneghörige:r',
  B = 'Betroffene:r',
  Anonym = 'anonym',
  qB =  'queer Betroffene:r (qB)',
  qF = 'queer Fachkraft (qF)',
  qA = 'queer Angehörige:r (qA)', 
  QueerAnonym = 'queer anonym',
  FfB = 'Fachkraft für Betroffene (FfB)',
  AfB = 'Angehörige:r für Betroffene (AfB)',
  FFqB = 'Fachkraft für queere Betroffene',
  AfqB = 'Angehörige für queere Betroffene'
};

export enum AnfrageArt {
  MedizinischeSoforthilfe = 'medizinische Soforthilfe',
  VertraulicheSpurensicherung = 'vertrauliche Spurensicherung',
  Beratungsbedarf = 'Beratungsbedarf',
  RechtlicheFragen = 'rechtliche Fragen',
  Sonstiges = 'Sonstiges',
};

export enum TerminOrt {
  LeipzigStadt = "Leipzig Stadt",
  LeipzigLand = "Leipzig Land",
  Nordsachsen = "Nordsachsen",
};

export type AnfrageOhneTermin = {
  termin_vergeben: false;
};

export type AnfrageMitTermin = {
  termin_vergeben: true;
  termin_datum: Date;
  termin_ort: TerminOrt;
};

export type AnfrageTermin = AnfrageOhneTermin | AnfrageMitTermin;

export interface Anfrage {
  anfrage_id: number;              // eindeutige ID der Anfrage
  anfrage_weg: string;            // Beschreibung, wie die Anfrage erfolgt ist
  anfrage_datum: Date;            // Datum der Anfrage
  anfrage_ort: AnfrageOrt;        // Ort der Anfrage
  anfrage_person: AnfragePerson;  // Wer hat angefragt
  anfrage_art: AnfrageArt;        // Art der Anfrage
  anfrage_termin: AnfrageTermin;  
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
};

export enum Beratungsart {
  persönlich = 'persönlich',
  video = 'video',
  telefon = 'telefon',
  aufsuchend = 'aufsuchend',
  schriftlich = 'schriftlich',
};

export enum Beratungsort {
  LeipzigStadt = 'Leipzig Stadt',
  LeipzigLand = 'Leipzig Land',
  Nordsachsen = 'Nordsachsen',
}

export type Beratungstermin = {
  beratungs_id: number;
  beratungsstelle: Beratungsstelle;
  anzahl_beratungen: number;
  termin_beratung: Date;
  beratungsart: Beratungsart;
  beratungsort: Beratungsort;
  notizen_beratung: string;
};

export type Fall = {
  fall_id: number;
  klient_id: number;
  beratungs_id: number;
  tat_id: number;
  begleitungs_id: number;
  user_id: number;
};

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

export enum BegleitungTyp {
  Gericht = "gericht",
  Polizei = "polizei",
  Rechtsanwalt = "rechtsanwalt",
  Arzt = "arzt",
  Rechtsmedizin = "rechtsmedizin",
  Jugendamt = "jugendamt",
  Sozialamt = "sozialamt",
  Jobcenter = "jobcenter",
  Beratungsstellen = "beratungsstellen",
  SchutzeinrichtungenAllgemein = "schutzeinrichtungen_allgemein",
  SchutzeinrichtungenSpezial = "schutzeinrichtungen_spezial",
  Interventionsstellen = "interventionsstellen",
  Sonstige = "sonstige",
}


export type BegleitungEintragStandard = {
  typ: Exclude<BegleitungTyp, BegleitungTyp.Sonstige>;
  anzahl: number;
};

export type BegleitungEintragSonstige = {
  typ: BegleitungTyp.Sonstige;
  anzahl: number;
  text: string;
};

export type BegleitungEintrag =
  | BegleitungEintragStandard
  | BegleitungEintragSonstige;

export type BegleitungBei = BegleitungEintrag[];

export enum Verweisungsart {
  Gericht = "gericht",
  Polizei = "polizei",
  Rechtsanwalt = "rechtsanwalt",
  Arzt = "arzt",
  Rechtsmedizin = "rechtsmedizin",
  Jugendamt = "jugendamt",
  Sozialamt = "sozialamt",
  Jobcenter = "jobcenter",
  Beratungsstellen = "beratungsstellen",
  SchutzeinrichtungenAllgemein = "schutzeinrichtungen_allgemein",
  SchutzeinrichtungenSpezial = "schutzeinrichtungen_spezial",
  Interventionsstellen = "interventionsstellen",
  Sonstige = "sonstige",
}

export type VerweisungEintragStandard = {
  typ: Exclude<Verweisungsart, Verweisungsart.Sonstige>;
  anzahl: number;
};

export type VerweisungEintragSonstige = {
  typ: Verweisungsart.Sonstige;
  anzahl: number;
  text: string;
};

export type VerweisungEintrag =
  | VerweisungEintragStandard
  | VerweisungEintragSonstige;

export type VerweisungenBei = VerweisungEintrag[];

export type Begleitung = {
  begleitungs_id: number;
  anzahl_begleitungen: number;
  anzahl_verweisungen: number;
  begleitung_bereiche: BegleitungBei;
  verweisungen_bereiche: VerweisungenBei;
  notizen?: string;
};

export enum PsychischeFolgen {
  depression = 'depression',
  angsttörung = 'angststörung',
  ptbs = 'PTBS',
  burnout = 'Burn-out',
  schalfstörungen = 'Schlafstörungen',
  sucht = 'sucht',
  kommunikationsschwierigkeiten = 'Kommunikationsschwierigkeiten',
  vernachlässigung = 'Vernachlässigung alltäglicher Dinge',
  keine = 'keine',
  andere = 'andere'
};

export enum KörperlicheFolgen {
  schmerz = 'Schmerz',
  lähmungen = 'Lähmungen',
  krankheit = 'krankheit',
  keine = 'keine',
  andere = 'andere'
};

export enum FinanzielleFolgen {
  ja = 'ja',
  nein = 'nein',
  freitext = 'freitextfeld'
};

export enum Arbeitseinschränkung {
  ja = 'ja',
  nein = 'nein',
  freitext = 'freitextfeld'
}

export enum VerlustArbeitsstelle {
  ja = 'ja',
  nein = 'nein',
  freitext = 'freitextfeld'
}

export enum SozialeIsolation {
  ja = 'ja',
  nein = 'nein',
  freitext = 'freitextfeld'
}

export enum Suizidalität {
  ja = 'ja',
  nein = 'nein',
  freitext = 'freitextfeld'
}

export enum KeineAngabe {
  ja = 'ja',
  nein = 'nein'
}

export type Gewaltfolge = {
  psychische_folgen: PsychischeFolgen;
  korperliche_folgen: KörperlicheFolgen;
  beeinträchtigungen: string;
  finanzielle_folgen: FinanzielleFolgen;
  arbeitseinschränkung: Arbeitseinschränkung;
  verlust_arbeitsstelle: VerlustArbeitsstelle;
  soziale_isolation: SozialeIsolation;
  suizidalität: Suizidalität;
  weiteres: string;
  keine_angabe: KeineAngabe;
  folgen_notizen: string;
}

export type AlterZumTatzeitpunkt = number | "keine Angabe";

export type TatZeitraum = {
  von: Date | null;
  bis: Date | null;
} | "keine Angabe";

export type AnzahlVorfälle = number | 'einmalig' | 'mehrere' | 'keine Angabe';

export type TäterInnenDaten = TäterInnenKeineAngabe | TäterInnenEinzeln | TäterInnenMehrere | TäterInnenUnbekannt;

export type TäterInnenKeineAngabe = {
  typ: 'keine_angabe';
};

export type TäterInnenEinzeln = {
  typ: 'einzeln';
  täter: TäterIn;
};

export type TäterInnenMehrere = {
  typ: 'mehrere_genau';
  anzahl: number;        // z. B. 3 oder 7
  täter: TäterIn[];      // genau so viele wie "anzahl"
};

export type TäterInnenUnbekannt = {
  typ: 'mehrere_unbekannt';
  täter?: TäterIn[]; // optional, da Anzahl nicht bekannt
};

export enum TäterGeschlecht {
  Weiblich = "weiblich",
  Männlich = "männlich",
  Divers = "divers",
  KeineAngabe = "keine Angabe",
}

export enum TäterBeziehung {
  Unbekannt = "Unbekannte:r",
  Bekannt = "Bekannte:r",
  Partner = "Partner:in",
  ExPartner = "Partner:in ehemalig",
  Ehepartner = "Ehepartner:in oder eingetragene:r Lebenspartner:in",
  Familienmitglied = "andere Familienangehörige",
  Sonstige = "sonstige Personen",
  KeineAngabe = "keine Angabe",
}

export type TäterIn = {
  geschlecht: TäterGeschlecht;
  beziehung: TäterBeziehung;
  notizen?: string;
};

export enum Tatart {
  sexuelleBelaestigung_Oeffentlich = "sexuelle Belästigung - öffentlicher Raum",
  sexuelleBelaestigung_Arbeit = "sexuelle Belästigung - Arbeitsplatz",
  sexuelleBelaestigung_Privat = "sexuelle Belästigung - privat",
  vergewaltigung = "Vergewaltigung",
  versuchteVergewaltigung = "versuchte Vergewaltigung",
  sexuellerMissbrauch = "sexueller Missbrauch",
  sexuellerMissbrauchKindheit = "sexueller Missbrauch in der Kindheit",
  sexuelleNoetigung = "sexuelle Nötigung",
  rituelleGewalt = "rituelle Gewalt",
  zwangsprostitution = "Zwangsprostitution",
  sexuelleAusbeutung = "sexuelle Ausbeutung",
  upskirting = "Upskirting",
  catcalling = "Catcalling",
  digitaleSexuelleGewalt = "digitale sexuelle Gewalt",
  spiking = "Spiking",
  andere = "Andere",
  keineAngabe = "Keine Angabe"
}

export enum Tatort {
  leipzig = 'Leipzig',
  leipzig_land = 'Leipzig Land',
  nordsachsen = 'Nordsachsen',
  sachsen = 'Sachsen',
  deutschland = 'Deutschland',
  ausland = 'ausland',
  flucht = 'auf der Flucht',
  herkunftsland = 'im Herkunftsland',
  keine_angabe = 'keine Angabe'
};

export enum TatAnzeige {
  ja = 'Ja',
  nein = 'Nein',
  nicht_entschieden = 'noch nicht entschieden',
  keine_angabe = 'keine Angabe'
};

export enum MedizinischeVersorgung {
  ja = 'Ja',
  nein = 'Nein',
  keine_angabe = 'keine Angabe'
}

export enum Spurensicherung {
  ja = 'Ja',
  nein = 'Nein',
  keine_angabe = 'keine Angabe'
}

export type Gewalttat = {
  tat_id: number;
  tat_alter: AlterZumTatzeitpunkt;
  tat_zeitraum: TatZeitraum;
  anzahl_vorfälle: AnzahlVorfälle;
  täter_innen: TäterInnenDaten;
  tatart: Tatart[];
  tatart_andere_text?: string;
  tatort: Tatort;
  tat_anzeige: TatAnzeige;
  medizinische_versorgung: MedizinischeVersorgung;
  spurensicherung: Spurensicherung;
  mitbetroffene_kinder: number;
  direktbetroffene_kinder: number;
  tat_notizen: string;
}

export enum KlientInRolle {
  betroffene = 'Betroffene:r',
  angehörige = 'Angehörige:r',
  fachkraft = 'Fachkraft'
}

export type KlientInAlter = number | 'keine Angabe';

export enum Geschlechtsidentität {
  CisWeiblich = 'cis weiblich',
  CisMännlich = 'cis männlich',
  TransWeiblich = 'trans weiblich',
  TransMännlich = 'trans männlich',
  TransNichtBinär = 'trans nicht-binär',
  Inter = 'inter',
  Agender = 'agender',
  Divers = 'divers',
  KeineAngabe = 'keine Angabe'
}

export type KlientInWohnortDaten = WohnortRegional| WohnortDeutschland| WohnortAndere;

export type WohnortRegional = {
  klient_in_wohnort:
    | KlientInWohnort.LeipzigStadt
    | KlientInWohnort.LeipzigLand
    | KlientInWohnort.Nordsachsen
    | KlientInWohnort.Sachsen
    | KlientInWohnort.KeineAngabe;
};

export type WohnortDeutschland = {
  klient_in_wohnort: KlientInWohnort.Deutschland;
  klient_in_wohnort_details: string;   // optional Freitext oder später "Land auswählen"
};

export type WohnortAndere = {
  klient_in_wohnort: KlientInWohnort.Andere;
  klient_in_wohnort_details: string;   // Freitext oder später Dropdown
};

export enum KlientInWohnort {
  LeipzigStadt = 'Leipzig Stadt',
  LeipzigLand = 'leipzig Land',
  Nordsachsen = 'Nordsachsen',
  Sachsen = 'Sachsen',
  Deutschland = 'Deutschland',
  Andere = 'andere',
  KeineAngabe = 'keine Angabe',
}

export type StaatsangehörigkeitAndere = {
  klient_in_staatsangehörigkeit: KlientInStaatsangehörigkeit.Andere;
  klient_in_staatsangehörigkeit_details: string;
}

export enum KlientInStaatsangehörigkeit {
  Deutsch = 'deutsch',
  Andere = 'nicht deutsch'
}

export enum KlientInBeruf {
  arbeitslos = 'arbeitslos',
  studierend = 'studierend',
  berufstätig = 'berufstätig',
  berentet = 'berentet',
  azubi = 'Azubi',
  berufsunfähig = 'berufsunfähig',
  keine_angabe = 'keine Angabe'
}

export type Schwerbehinderung = {
  klient_in_schwerbehinderung: KlientInSchwerbehinderung.Ja;
  grad_der_behinderung: number;
}

export enum FormDerBehinderung {
  Kognitiv = 'kognitiv',
  Körperlich = 'körperlich'
}

export enum KlientInSchwerbehinderung {
  Ja = 'ja',
  Nein = 'nein'
}

export type KontaktPunktAndere = {
  klient_in_kontaktpunkt: KlientInKontaktpunkt.Andere;
  klient_in_kontaktpunkt_details: string;

}
export enum KlientInKontaktpunkt {
  Polizei = 'Polizei',
  PrivateKontakte = 'Private Kontakte',
  Beratungsstellen = 'Beratungsstellen',
  Internet = 'Internet',
  Ämter = 'Ämter',
  Gesundheitswesen = 'Gesundheitswesen (Arzt/Ärztin)',
  Rechtsanwältinnen = 'Rechtsanwälte/-anwältinnen',
  Andere = 'andere Quelle',
  KeineAngabe = 'keine Angabe'
}

export enum Sexualität {
  Lesbisch = 'lesbisch',
  Schwul = 'schwul',
  Bisexuell = 'bisexuell',
  Asexuell = 'asexuell',
  Heterosexuell = 'heterosexuell',
  KeineAngabe = 'keine Angabe'
}

export type KlientIn = {
  klient_in_id: number;
  klient_in_rolle: KlientInRolle;
  klient_in_alter: KlientInAlter;
  klient_in_geschlechtsidentität: Geschlechtsidentität;
  klient_in_sexualität: Sexualität;
  klient_in_wohnort: KlientInWohnortDaten;
  klient_in_staatsangehörigkeit: KlientInStaatsangehörigkeit;
  staatsangehörigkeit_nicht_deutsch?: string;
  klient_in_beruf: KlientInBeruf;
  klient_in_schwerbehinderung: KlientInSchwerbehinderung;
  klient_in_kontaktpunkt: KlientInKontaktpunkt;
  klient_in_dolmetschungsstunden: number;
  klient_in_dolmetschungssprachen: string;
  klient_in_notizen: string;
}




