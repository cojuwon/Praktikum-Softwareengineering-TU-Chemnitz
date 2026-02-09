import Link from 'next/link';

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
          padding: "40px",
          margin: "0 20px",
          borderRadius: "12px",
          boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)"
        }}
      >
        <h1
          style={{
            fontSize: "28px",
            fontWeight: "600",
            color: "#42446F",
            marginBottom: "30px",
            textAlign: "center",
          }}
        >
          Willkommen bei Bellis e.V.
        </h1>

        <div style={{
          display: "flex",
          justifyContent: "center",
          gap: "20px",
          flexWrap: "wrap"
        }}>
          <Link
            href="/dashboard/anfrage/create"
            style={{
              backgroundColor: "#42446F",
              color: "white",
              padding: "12px 24px",
              borderRadius: "8px",
              textDecoration: "none",
              fontWeight: "500",
              fontSize: "16px",
              transition: "transform 0.1s",
              display: "inline-block",
              textAlign: "center",
              minWidth: "160px"
            }}
          >
            Neue Anfrage
          </Link>

          <Link
            href="/dashboard/fall/create"
            style={{
              backgroundColor: "#42446F",
              color: "white",
              padding: "12px 24px",
              borderRadius: "8px",
              textDecoration: "none",
              fontWeight: "500",
              fontSize: "16px",
              transition: "transform 0.1s",
              display: "inline-block",
              textAlign: "center",
              minWidth: "160px"
            }}
          >
            Neuer Fall
          </Link>
        </div>
      </div>
    </div>
  );
}