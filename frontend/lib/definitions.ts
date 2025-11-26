// This file contains type definitions for your data.
// It describes the shape of the data, and what data type each property should accept.
// For simplicity of teaching, we're manually defining these types.
// However, these types are generated automatically if you're using an ORM such as Prisma.

import { EnumDeclaration } from "typescript";

/*
export type User = {
  id: string;
  name: string;
  email: string;
  password: string;
};

export type Customer = {
  id: string;
  name: string;
  email: string;
  image_url: string;
};

export type Invoice = {
  id: string;
  customer_id: string;
  amount: number;
  date: string;
  // In TypeScript, this is called a string union type.
  // It means that the "status" property can only be one of the two strings: 'pending' or 'paid'.
  status: 'pending' | 'paid';
};

export type Revenue = {
  month: string;
  revenue: number;
};

export type LatestInvoice = {
  id: string;
  name: string;
  image_url: string;
  email: string;
  amount: string;
};

// The database returns a number for amount, but we later format it to a string with the formatCurrency function
export type LatestInvoiceRaw = Omit<LatestInvoice, 'amount'> & {
  amount: number;
};

export type InvoicesTable = {
  id: string;
  customer_id: string;
  name: string;
  email: string;
  image_url: string;
  date: string;
  amount: number;
  status: 'pending' | 'paid';
};

export type CustomersTableType = {
  id: string;
  name: string;
  email: string;
  image_url: string;
  total_invoices: number;
  total_pending: number;
  total_paid: number;
};

export type FormattedCustomersTable = {
  id: string;
  name: string;
  email: string;
  image_url: string;
  total_invoices: number;
  total_pending: string;
  total_paid: string;
};

export type CustomerField = {
  id: string;
  name: string;
};

export type InvoiceForm = {
  id: string;
  customer_id: string;
  amount: number;
  status: 'pending' | 'paid';
};
*/

export enum AnfrageOrt {
  LeipzigStadt = 'Leipzig Stadt',
  LeipzigLand = 'Leipzig Land',
  Nordsachsen = 'Nordsachsen',
  Sachsen = 'Sachsen',
  Andere = 'Andere',
}

export enum AnfragePerson {
  Fachkraft = 'F',
  Angehoerige = 'A',
  Betroffene = 'B',
}

export enum AnfrageArt {
  MedizinischeSoforthilfe = 'medizinische Soforthilfe',
  VertraulicheSpurensicherung = 'vertrauliche Spurensicherung',
  Beratungsbedarf = 'Beratungsbedarf',
  RechtlicheFragen = 'rechtliche Fragen',
  Sonstiges = 'Sonstiges',
}

export interface Anfrage {
  id: number;                     // eindeutige ID der Anfrage
  anfrage_weg: string;            // Beschreibung, wie die Anfrage erfolgt ist
  anfrage_datum: Date;            // Datum der Anfrage
  anfrage_ort: AnfrageOrt;        // Ort der Anfrage
  anfrage_person: AnfragePerson;  // Wer hat angefragt
  anfrage_art: AnfrageArt;        // Art der Anfrage
  beratungs_id?: number;          // Optional, wenn Termin vereinbart
  user_id: number;                // Mitarbeiter:in, der die Anfrage zugewiesen bekommen hat
}

export interface Fall {
  fall_id: number;         // automatisch generierte ID
  klient_id: number;       // zugeordnete Klient:in
  beratungs_id: number;    // zugeordnete Beratung
  tat_id: number;          // zugehörige Gewalttat
  begleitungs_id: number;  // zugeordnete Begleitung
  user_id: number;         // zuständige Mitarbeiter:in
}