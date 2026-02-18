"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { DynamicForm, FieldDefinition } from "@/components/form/DynamicForm";
import Image from "next/image";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { ArrowLeftIcon, PlusIcon } from "@heroicons/react/24/outline";
import FallMetadata from "@/components/dashboard/fall/FallMetadata";
import TimelineItem from "@/components/dashboard/fall/TimelineItem";
import RichTextEditor from "@/components/editor/RichTextEditor";
import AppointmentDialog from "@/components/dashboard/fall/AppointmentDialog";

export default function FallEditPage() {
  const { id } = useParams<{ id: string }>();

  const [definition, setDefinition] = useState<FieldDefinition[] | null>(null);
  const [data, setData] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);

  // Edit Modes
  const [isEditingMetadata, setIsEditingMetadata] = useState(false);
  const [showAppointmentDialog, setShowAppointmentDialog] = useState(false);
  const [noteContent, setNoteContent] = useState<any>({});

  // ---------------------------------------
  // 1. LADE DATEN
  // ---------------------------------------
  const loadData = () => {
    Promise.all([
      apiFetch(`/api/faelle/${id}/`).then((res) => {
        if (!res.ok) throw new Error("Fall fetch failed: " + res.status);
        return res.json();
      }),
      apiFetch("/api/faelle/form-fields/").then((res) => {
        if (!res.ok) throw new Error("Fields fetch failed: " + res.status);
        return res.json();
      }),
    ])
      .then(([fallData, fieldsData]) => {
        setData(fallData);
        setDefinition(fieldsData.fields);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Fehler beim Laden:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, [id]);

  // ---------------------------------------
  // 2. METADATA SPEICHERN
  // ---------------------------------------
  const handleMetadataSubmit = async () => {
    if (!data) return;
    try {
      const res = await apiFetch(`/api/faelle/${id}/`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data), // Use data from state
      });

      if (!res.ok) throw new Error("Update failed");

      setIsEditingMetadata(false);
      loadData(); // Reload to get fresh data
    } catch (e) {
      console.error(e);
      alert("Fehler beim Speichern");
    }
  };

  // ---------------------------------------
  // 3. NOTIZ ERSTELLEN
  // ---------------------------------------
  const handleSaveNote = async () => {
    if (!noteContent || (Object.keys(noteContent).length === 0)) return;

    try {
      const res = await apiFetch(`/api/fall-notizen/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fall: id,
          content: noteContent
        }),
      });

      if (!res.ok) throw new Error("Note creation failed");

      setNoteContent({}); // Reset editor
      loadData(); // Refresh timeline
    } catch (e) {
      console.error(e);
      alert("Fehler beim Speichern der Notiz");
    }
  }


  if (loading) return <div className="p-10 text-center text-slate-500">Lade Fall...</div>;
  if (!data || !definition) return <div className="p-10 text-center text-red-500">Fall nicht gefunden.</div>;

  return (
    <div className="max-w-[1400px] mx-auto p-6">
      {/* HEADER */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/fall" className="text-slate-400 hover:text-slate-600 transition-colors">
          <ArrowLeftIcon className="h-6 w-6" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Fall #{data.fall_id}</h1>
          <p className="text-sm text-slate-500">Details und Verlauf</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* LEFT COLUMN: METADATA (Sidebar) */}
        <div className="lg:col-span-4 space-y-6 sticky top-6">
          {isEditingMetadata ? (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <h3 className="font-semibold text-lg mb-4">Stammdaten bearbeiten</h3>
              <DynamicForm
                definition={definition}
                values={data}
                onSubmit={handleMetadataSubmit}
                onChange={() => { }} // Controlled in DynamicForm mostly
              />
              <button
                onClick={() => setIsEditingMetadata(false)}
                className="mt-3 w-full text-center text-sm text-slate-500 hover:text-slate-800"
              >
                Abbrechen
              </button>
            </div>
          ) : (
            <FallMetadata
              data={data}
              definition={definition}
              onEdit={() => setIsEditingMetadata(true)}
            />
          )}
        </div>

        {/* RIGHT COLUMN: TIMELINE & ACTIONS */}
        <div className="lg:col-span-8 space-y-8">

          {/* ACTION AREA: ADD NOTE / APPOINTMENT */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <h3 className="font-semibold text-slate-700">Neuer Eintrag</h3>
              <button
                onClick={() => setShowAppointmentDialog(true)}
                className="text-sm text-blue-600 font-medium hover:underline"
              >
                + Termin planen
              </button>
            </div>
            <div className="p-5">
              <RichTextEditor
                content={noteContent}
                onChange={setNoteContent}
              />
              <div className="mt-3 flex justify-end">
                <button
                  onClick={handleSaveNote}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors shadow-sm"
                >
                  Notiz speichern
                </button>
              </div>
            </div>
          </div>

          {/* TIMELINE */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-slate-800 px-2">Verlauf</h3>

            {data.timeline && data.timeline.length > 0 ? (
              <div className="relative pl-4">
                {data.timeline.map((item: any, idx: number) => (
                  <TimelineItem
                    key={`${item.type}-${item.notiz_id || item.beratungs_id}`}
                    item={item}
                    onEdit={(i) => console.log("Edit item", i)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                Noch keine Einträge vorhanden.
              </div>
            )}
          </div>

        </div>

      </div>

      {showAppointmentDialog && (
        <AppointmentDialog
          fallId={id}
          onClose={() => setShowAppointmentDialog(false)}
          onSuccess={() => {
            loadData();
          }}
        />
      )}
    </div>
  );
}
