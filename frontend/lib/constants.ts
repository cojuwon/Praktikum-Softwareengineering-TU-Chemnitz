export const GENDER_CHOICES: Record<string, string> = {
    'CW': 'cis weiblich',
    'CM': 'cis männlich',
    'TW': 'trans weiblich',
    'TM': 'trans männlich',
    'TN': 'trans nicht-binär',
    'I': 'inter',
    'A': 'agender',
    'D': 'divers',
    'K': 'keine Angabe',
};

export const SEXUALITY_CHOICES: Record<string, string> = {
    'L': 'lesbisch',
    'S': 'schwul',
    'B': 'bisexuell',
    'AX': 'asexuell',
    'H': 'heterosexuell',
    'K': 'keine Angabe',
};

export const LOCATION_CHOICES: Record<string, string> = {
    'LS': 'Leipzig Stadt',
    'LL': 'Leipzig Land',
    'NS': 'Nordsachsen',
    'S': 'Sachsen (Andere)',
    'D': 'Deutschland (Andere)',
    'A': 'Ausland',
    'K': 'keine Angabe',
};

export const YES_NO_KA_CHOICES: Record<string, string> = {
    'J': 'Ja',
    'N': 'Nein',
    'KA': 'keine Angabe',
};

export const CONSULTATION_TYPE_CHOICES: Record<string, string> = {
    'P': 'persönlich',
    'V': 'Video',
    'T': 'Telefon',
    'A': 'aufsuchend',
    'S': 'schriftlich',
};

export const CONSULTATION_STATUS_CHOICES: Record<string, string> = {
    'g': 'geplant',
    's': 'stattgefunden',
    'a': 'ausgefallen',
};

export const CASE_STATUS_CHOICES: Record<string, string> = {
    'O': 'Offen',
    'L': 'Laufend',
    'A': 'Abgeschlossen',
};

// Helper function to get label
export function getLabel(mapping: Record<string, string>, key: string | null | undefined): string {
    if (!key) return '-';
    return mapping[key] || key;
}

export const TAETER_BEZIEHUNG_CHOICES: Record<string, string> = {
    'P': 'Partner:in',
    'EXP': 'Partner:in ehemalig',
    'EF': 'Ehepartner:in / eingetragene:r Lebenspartner:in',
    'EFX': 'Ehepartner:in / eingetragene:r Lebenspartner:in ehemalig',
    'FAM': 'Familienangehörige (Eltern/Stiefeltern)',
    'VER': 'andere Verwandte',
    'NAH': 'soziales Nahfeld (Bekannte, Nachbarn, Kollegen)',
    'PRO': 'professionelle Beziehung (Lehrer, Arzt, Trainer etc.)',
    'HGM': 'häusliche Gemeinschaft (WG, Heim etc.)',
    'SON': 'sonstige Personen',
    'UNB': 'Unbekannte:r',
    'K': 'keine Angabe',
};

export const TAETER_GESCHLECHT_CHOICES: Record<string, string> = {
    'W': 'weiblich',
    'M': 'männlich',
    'D': 'divers',
    'U': 'unbekannt',
    'K': 'keine Angabe',
};

export const ANZEIGE_CHOICES: Record<string, string> = {
    'J': 'Ja',
    'N': 'Nein',
    'E': 'noch nicht entschieden',
    'K': 'keine Angabe',
};
