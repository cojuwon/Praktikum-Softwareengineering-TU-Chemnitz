/*import Link from 'next/link';

export default function Page() {
  const buttonStyle = {
    display: 'block',
    width: '100%',
    maxWidth: '300px',
    padding: '8px 16px',
    marginBottom: '16px',
    backgroundColor: 'transparent',
    color: '#000000ff',
    textAlign: 'center' as const,
    fontSize: '18px',
    fontWeight: '500',
    borderRadius: '8px',
    border: '2px solid #000000ff',
    textDecoration: 'none',
    transition: 'all 0.2s',
  };

  return (
    <main style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '24px' 
    }}>
      <h1 style={{ 
        fontSize: '32px', 
        fontWeight: 'bold', 
        marginBottom: '48px',
        textAlign: 'center'
      }}>
        Fall-Verwaltung
      </h1>
      
      <div style={{ width: '100%', maxWidth: '300px' }}>
        <Link href="/dashboard/fall/create" style={buttonStyle}>
          Neuen Fall erstellen
        </Link>

        <Link href="/dashboard/fall/edit" style={buttonStyle}>
          Fall bearbeiten
        </Link>

        <Link href="/dashboard/fall/overview" style={buttonStyle}>
          Alle Fälle anzeigen
        </Link>
      </div>
    </main>
  );
}*/



import Link from 'next/link';

export default function Page() {
  const buttonStyle = {
    display: 'block',
    width: '100%',
    maxWidth: '220px', // Schmaler!
    padding: '10px 20px',
    marginBottom: '16px',
    backgroundColor: 'white',
    color: '#3E5C9E',
    textAlign: 'center' as const,
    fontSize: '16px',
    fontWeight: '500',
    borderRadius: '6px',
    border: '1.5px solid #3E5C9E',
    textDecoration: 'none',
    transition: 'all 0.2s',
  };

  return (
    <main style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '24px',
      background: 'radial-gradient(circle, rgba(255, 215, 0, 1) 0%, rgba(255, 215, 0, 1) 40%, rgba(62, 92, 158, 1) 80%, rgba(62, 92, 158, 1) 100%)'
    }}>
      {/* Zurück Button */}
      <Link
        href="/dashboard"
        style={{
          position: 'absolute',
          top: '24px',
          left: '24px',
          color: 'white',
          textDecoration: 'none',
          fontSize: '14px',
          fontWeight: '600',
        }}
      >
        ← Zurück zur Übersicht
      </Link>

      {/* Weiße Box */}
      <div style={{
        width: '100%',
        maxWidth: '700px',
        backgroundColor: 'white',
        borderRadius: '20px',
        padding: '50px 60px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
      }}>
        <h1 style={{ 
          fontSize: '32px', 
          fontWeight: '600', 
          marginBottom: '40px',
          textAlign: 'center',
          color: '#1a1a1a'
        }}>
          Fall-Verwaltung
        </h1>
        
        <div style={{ 
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '100%'
        }}>
          <Link href="/dashboard/fall/create" style={buttonStyle}>
            Neuen Fall erstellen
          </Link>

          <Link href="/dashboard/fall/edit" style={buttonStyle}>
            Fall bearbeiten
          </Link>

          <Link href="/dashboard/fall/overview" style={buttonStyle}>
            Alle Fälle anzeigen
          </Link>
        </div>
      </div>
    </main>
  );
}