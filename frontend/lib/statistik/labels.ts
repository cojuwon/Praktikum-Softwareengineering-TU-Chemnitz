/**
 * Entfernt führende Fragecodes wie:
 * - "03-2-1 gesamt"
 * - "03-2-2 bis 03-2-7 Institutionen"
 * - "05-1 Woher haben …"
 * und formatiert für UI-Anzeige
 */
export function formatQuestionLabel(label: string): string {
  if (!label) return label;

  let result = label;

  // 1️⃣ Entfernt komplexe Nummern-Präfixe inkl. "bis"-Bereiche
  // Beispiele:
  // "03-2-1 gesamt" → "gesamt"
  // "03-2-2 bis 03-2-7 Institutionen" → "Institutionen"
  result = result.replace(
    /^\d+(?:-\d+)*(?:\s+bis\s+\d+(?:-\d+)*)?\s+/i,
    ""
  );

  // 2️⃣ Trim
  result = result.trim();

  // 3️⃣ Ersten Buchstaben groß schreiben
  result = result.charAt(0).toUpperCase() + result.slice(1);

  return result;
}
