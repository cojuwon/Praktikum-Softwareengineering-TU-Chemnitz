"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FallSearchForm } from "@/components/form/FallSearchForm";
import Image from "next/image";

export default function FallSuchePage() {
  const router = useRouter();
  const [results, setResults] = useState([]);

  const handleSearch = async (filters: any) => {
    const res = await fetch("/api/fall/query", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(filters),
    });

    const data = await res.json();
    console.log(data);
    setResults(data.data ?? []);
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: "auto",
        minHeight: "100vh",
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
            margin: "20px auto",
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
            Fälle suchen
          </h1>
          <p
            style={{
              fontSize: "14px",
              color: "#6b7280",
              textAlign: "center",
              margin: 0,
            }}
          >
            Suchen Sie nach bestehenden Fällen
          </p>
        </div>

        <div
          style={{
            backgroundColor: "white",
            padding: "20px 40px 30px 40px",
            margin: "0 20px",
            borderRadius: "0 0 12px 12px",
          }}
        >
          <FallSearchForm onSubmit={handleSearch} />

          <hr style={{ margin: "30px 0", border: "none", borderTop: "1px solid #e5e7eb" }} />

          <h2
            style={{
              fontSize: "20px",
              fontWeight: "600",
              color: "#42446F",
              marginBottom: "15px",
            }}
          >
            Ergebnisse
          </h2>

          {results.length === 0 && (
            <p style={{ textAlign: "center", color: "#6b7280" }}>
              Keine Fälle gefunden.
            </p>
          )}

          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {results.map((fall: any) => (
              <li
                key={fall.id}
                onClick={() => router.push(`/dashboard/fall/edit/${fall.id}`)}
                style={{
                  cursor: "pointer",
                  padding: "12px 16px",
                  marginBottom: "10px",
                  backgroundColor: "#f9fafb",
                  border: "2px solid #e5e7eb",
                  borderRadius: "8px",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#f3f4f6";
                  e.currentTarget.style.borderColor = "#A0A8CD";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#f9fafb";
                  e.currentTarget.style.borderColor = "#e5e7eb";
                }}
              >
                <strong style={{ color: "#42446F" }}>Fall #{fall.id}</strong>
                <span style={{ color: "#6b7280" }}> – {fall.name} ({fall.datum})</span>
              </li>
            ))}
          </ul>
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