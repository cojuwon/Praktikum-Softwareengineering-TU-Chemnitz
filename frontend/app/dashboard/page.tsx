import Link from 'next/link';
import { lusitana } from '@/components/ui/fonts';
import Image from 'next/image';

export default function Page() {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: "auto",
        padding: "10px 24px 0 24px",
        backgroundColor: "#F3EEEE",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <div
        style={{
          maxWidth: "700px",
          margin: "0 auto",
          width: "100%",
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
            Willkommen auf dem Dashboard
          </h1>
          <p
            style={{
              fontSize: "14px",
              color: "#6b7280",
              textAlign: "center",
              margin: 0,
            }}
          >
            Wählen Sie einen Bereich
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
            href="/dashboard/anfrage"
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
            Anfrage
          </Link>

          <Link
            href="/dashboard/fall"
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
            Fall
          </Link>

          <Link
            href="/dashboard/statistik"
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
            Statistik
          </Link>
        </div>
      </div>

      <Image
        src="/drei-welle-zusammenblau.png"
        alt=""
        width={1400}
        height={100}
        style={{
          width: "150%",
          height: "auto",
          objectFit: "cover",
          transform: "scaleY(1) scaleX(1.21)",
          display: "block",
          marginLeft: "-10%",
        }}
      />
    </div>
  );
}