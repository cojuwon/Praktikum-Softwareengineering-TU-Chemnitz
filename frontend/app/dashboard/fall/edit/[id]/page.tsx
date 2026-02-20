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
import NoteEditDialog from "@/components/dashboard/fall/NoteEditDialog";
import AppointmentDialog from "@/components/dashboard/fall/AppointmentDialog";
import { getLabel, CONSULTATION_TYPE_CHOICES } from "@/lib/constants";

export default function FallEditPage() {
  const { id } = useParams<{ id: string }>();

  const [definition, setDefinition] = useState<FieldDefinition[] | null>(null);
  const [data, setData] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);

  // Edit Modes
  const [isEditingMetadata, setIsEditingMetadata] = useState(false);
  const [showAppointmentDialog, setShowAppointmentDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null); // For Note or Appointment
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
  const [noteDate, setNoteDate] = useState(new Date().toISOString().slice(0, 16));
  const [linkedAppointmentId, setLinkedAppointmentId] = useState<string>("");

  const handleSaveNote = async () => {
    if (!noteContent || (Object.keys(noteContent).length === 0)) return;

    try {
      const res = await apiFetch(`/api/fall-notizen/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fall: id,
          content: noteContent,
          datum: noteDate,
          beratungstermin: linkedAppointmentId || null
        }),
      });

      if (!res.ok) throw new Error("Note creation failed");

      setNoteContent({}); // Reset editor
      setNoteDate(new Date().toISOString().slice(0, 16)); // Reset date
      setLinkedAppointmentId(""); // Reset link
      loadData(); // Refresh timeline
    } catch (e) {
      console.error(e);
      alert("Fehler beim Speichern der Notiz");
    }
  }


  if (loading) return <div className="p-10 text-center text-slate-500">Lade Fall...</div>;
  if (!data || !definition) return <div className="p-10 text-center text-red-500">Fall nicht gefunden.</div>;

  // Filter appointments for dropdown
  const appointments = data.timeline
    ? data.timeline.filter((i: any) => i.type === 'appointment')
    : [];

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
                className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors shadow-sm"
              >
                + Termin planen
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Optional: Date and Link Inputs */}
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-slate-500 mb-1">Datum</label>
                  <input
                    type="datetime-local"
                    className="w-full text-sm rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={noteDate}
                    onChange={(e) => setNoteDate(e.target.value)}
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-medium text-slate-500 mb-1">Verknüpfter Termin (Optional)</label>
                  <select
                    className="w-full text-sm rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={linkedAppointmentId}
                    onChange={(e) => setLinkedAppointmentId(e.target.value)}
                  >
                    <option value="">-- Kein Termin --</option>
                    {appointments.map((apt: any) => (
                      <option key={apt.beratungs_id} value={apt.beratungs_id}>
                        {new Date(apt.termin_beratung).toLocaleString()} ({apt.beratungsart_display || getLabel(CONSULTATION_TYPE_CHOICES, apt.beratungsart)})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <RichTextEditor
                content={noteContent}
                onChange={setNoteContent}
              />
              <div className="mt-3 flex justify-end">
                <button
                  onClick={handleSaveNote}
                  className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors shadow-sm disabled:opacity-50"
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
                    onEdit={(item) => setEditingItem(item)}
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

      {editingItem && editingItem.type === 'appointment' && (
        <AppointmentDialog
          fallId={id}
          appointment={editingItem}
          onClose={() => setEditingItem(null)}
          onSuccess={() => {
            loadData();
          }}
        />
      )}

      {editingItem && editingItem.type === 'note' && (
        <NoteEditDialog
          fallId={id}
          note={editingItem}
          appointments={appointments}
          onClose={() => setEditingItem(null)}
          onSuccess={() => {
            loadData();
          }}
        />
      )}
    </div>
  );
}
