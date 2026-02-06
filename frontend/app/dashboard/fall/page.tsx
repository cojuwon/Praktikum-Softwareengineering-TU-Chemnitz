import Link from 'next/link';
import { lusitana } from '@/components/ui/fonts';
import Image from 'next/image';

export default function Page() {
  return (
    <div
      style={{
        maxWidth: "700px",
        margin: "0 auto",
        width: "100%",
        padding: "24px 24px 0 24px"
      }}
    >
      <Image
        src="/bellis-favicon.png"
        alt="Bellis Logo"
        width={100}
        height={100}
        style={{
          width: "60px",
          height: "auto",
          objectFit: "contain",
          display: "block",
          margin: "60px auto 20px auto",
        }}
      />

      <div
        style={{
          backgroundColor: "white",
          padding: "40px 40px",
          margin: "0 20px 0px 20px",
          borderRadius: "12px 12px 0 0",
        }}
      >
        <h1
          style={{
            fontSize: "28px",
            fontWeight: "600",
            color: "#42446F",
            marginBottom: "6px",
            textAlign: "center",
          }}
        >
          Fälle verwalten
        </h1>
        <p
          style={{
            fontSize: "14px",
            color: "#6b7280",
            textAlign: "center",
            margin: 0,
          }}
        >
          Wählen Sie eine Option
        </p>
      </div>

      <div
        style={{
          backgroundColor: "white",
          padding: "20px 20px",
          margin: "0 20px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          borderRadius: "0 0 12px 12px",
          gap: "15px",
        }}
      >
        <Link
          href="/dashboard/fall/create"
          style={{
            width: "100%",
            maxWidth: "350px",
            backgroundColor: "transparent",
            color: "#131313",
            border: "3px solid #A0A8CD",
            borderRadius: "8px",
            padding: "10px 16px",
            fontSize: "16px",
            fontWeight: "500",
            cursor: "pointer",
            textAlign: "center",
            textDecoration: "none",
            display: "block",
          }}
        >
          Neuen Fall erstellen
        </Link>

        <Link
          href="/dashboard/fall/edit"
          style={{
            width: "100%",
            maxWidth: "350px",
            backgroundColor: "transparent",
            color: "#131313",
            border: "3px solid #A0A8CD",
            borderRadius: "8px",
            padding: "10px 16px",
            fontSize: "16px",
            fontWeight: "500",
            cursor: "pointer",
            textAlign: "center",
            textDecoration: "none",
            display: "block",
          }}
        >
          Fall bearbeiten
        </Link>
      </div>
    </div>
  );
}