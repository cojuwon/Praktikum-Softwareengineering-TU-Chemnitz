"use client";

import Link from "next/link";

export function EditFallButton({ id }: { id: number }) {
  return (
    <Link
      href={`/dashboard/fall/edit/${id}`}
      className="text-blue-600 hover:underline ml-4"
    >
      Bearbeiten
    </Link>
  );
}