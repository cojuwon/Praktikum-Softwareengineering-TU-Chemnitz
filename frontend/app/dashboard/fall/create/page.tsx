import FallForm from "@/components/fall/fallForm";
import Link from "next/link";

export default function CreateFallPage() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      minHeight: '100vh',
      padding: '24px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '600px',
        marginBottom: '24px'
      }}>
        <Link
          href="/dashboard/fall"
          style={{
            display: 'inline-block',
            color: '#3b82f6',
            textDecoration: 'none',
            marginBottom: '16px',
            fontSize: '14px'
          }}
        >
          ← Zurück zur Übersicht
        </Link>
        <h1 style={{
          fontSize: '32px',
          fontWeight: '600',
          color: '#111827',
          marginBottom: '8px'
        }}>
          Neuen Fall erstellen
        </h1>
        <p style={{
          fontSize: '14px',
          color: '#6b7280',
          marginBottom: '24px'
        }}>
          Füllen Sie die Felder aus, um einen neuen Fall anzulegen.
        </p>
      </div>
      <div style={{ width: '100%', maxWidth: '600px' }}>
        <FallForm />
      </div>
    </div>
  );
}