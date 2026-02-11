"use client";

type Props = {
  data: any[];
};

export function StatistikKPIs({ data }: Props) {
  if (!data || data.length === 0) return null;

  const total = data[0].total;
  const anfragen = data[0].anfragen;
  const faelle = data[0].fall;

  return (
    <div className="flex gap-4">
      <div><strong>Gesamt:</strong> {total}</div>
      <div><strong>Anfragen:</strong> {anfragen}</div>
      <div><strong>Fälle:</strong> {faelle}</div>
    </div>
  );
}

