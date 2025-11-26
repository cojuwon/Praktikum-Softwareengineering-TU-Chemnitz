"use client";

import { deleteFall } from "@/lib/api";

export function DeleteFallButton({ id }: { id: number }) {

  async function handleDelete() {
    const confirmDelete = confirm("Willst du diesen Fall wirklich löschen?");
    if (!confirmDelete) return;

    try {
      await deleteFall(id);
      window.location.reload();
    } catch (error) {
      console.error("Fehler beim Löschen des Falls:", error);
      alert("Der Fall konnte nicht gelöscht werden.");
    }
  }

  return (
    <button
      onClick={handleDelete}
      className="text-red-600 hover:underline ml-4"
    >
      Löschen
    </button>
  );
}