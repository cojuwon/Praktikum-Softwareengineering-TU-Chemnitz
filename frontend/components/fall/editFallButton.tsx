"use client";

import Link from "next/link";

export function EditFallButton({ id }: { id: number }) {
  return (
    <Link
      href={`/cases/${id}/edit`}
      className="text-blue-600 hover:underline"
    >
      Bearbeiten
    </Link>
  );
}