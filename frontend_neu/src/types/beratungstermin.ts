import { BeratungsstelleCode } from './anfrage';

/**
 * Beratungstermin Model
 * Endpoint: /api/beratungstermine/
 */
export interface Beratungstermin {
    termin_id: number;
    termin_datum: string; // ISO Date "YYYY-MM-DD"
    termin_uhrzeit: string; // "HH:MM:SS"
    beratungsstelle: BeratungsstelleCode;
    beratungsart: string;
    // Optional, falls das Backend diese Infos mitliefert
    klient_display?: string;
    fall?: number;
}

export interface BeratungsterminListResponse {
    count?: number;
    next?: string | null;
    previous?: string | null;
    results: Beratungstermin[];
}
