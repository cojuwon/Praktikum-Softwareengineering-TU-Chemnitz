"use client";

type Props = {
  data: any[];
};

export function StatistikKPIs({ data }: Props) {
  const total = data.length;
  const anfragen = data.filter(d => d.fall_typ === "Anfrage").length;
  const faelle = data.filter(d => d.fall_typ === "Fall").length;

  return (
    <div className="flex gap-4">
      <div><strong>Gesamt:</strong> {total}</div>
      <div><strong>Anfragen:</strong> {anfragen}</div>
      <div><strong>Fälle:</strong> {faelle}</div>
    </div>
  );
}

