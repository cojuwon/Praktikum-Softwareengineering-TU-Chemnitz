"use client";

import { useState } from "react";

export type Termin = {
  datum: string;
  art: string;
  notiz: string;
};

type Props = {
  onChange: (termin: Termin) => void;
  initial?: Termin;
};

export function BeratungsterminForm({ onChange, initial }: Props) {
  const [termin, setTermin] = useState<Termin>(
    initial ?? { datum: "", art: "telefon", notiz: "" }
  );

  const handleChange = (field: keyof Termin, value: string) => {
    const updated = { ...termin, [field]: value };
    setTermin(updated);
    onChange(updated);
  };

  return (
    <div>
      <h2>Neuen Beratungstermin eintragen</h2>

      <div>
        <label>Datum:</label>
        <input
          type="date"
          value={termin.datum}
          onChange={(e) => handleChange("datum", e.target.value)}
        />
      </div>

      <div>
        <label>Art:</label>
        <select
          value={termin.art}
          onChange={(e) => handleChange("art", e.target.value)}
        >
          <option value="telefon">Telefon</option>
          <option value="email">E-Mail</option>
          <option value="gespräch">Persönliches Gespräch</option>
        </select>
      </div>

      <div>
        <label>Notiz:</label>
        <textarea
          value={termin.notiz}
          onChange={(e) => handleChange("notiz", e.target.value)}
        />
      </div>
    </div>
  );
}
