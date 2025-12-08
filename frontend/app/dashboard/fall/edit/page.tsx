"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function SelectFallPage() {
  const [fallId, setFallId] = useState("");
  const router = useRouter();

  function handleSubmit(e) {
    e.preventDefault();

    if (!fallId || fallId === "0") {
      alert("Bitte gib eine gültige Fall-ID ein");
      return;
    }

    router.push(`/dashboard/fall/edit/${fallId}`);
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "40px 24px",
        backgroundColor: "#f9fafb",
      }}
    >
      <div
        style={{
          maxWidth: "700px",
          margin: "0 auto",
        }}
      >
        <Link
          href="/dashboard/fall"
          style={{
            display: "inline-block",
            color: "#000",
            textDecoration: "none",
            marginBottom: "00px",
            fontSize: "14px",
            marginLeft: "-250px",
          }}
        >
          ← Zurück zur Übersicht
        </Link>

        <Image
          src="/hellblaue-welle.png"
          alt=""
          width={1400}
          height={100}
          style={{
            width: "25%",
            height: "auto",
            maxHeight: "40px",
            objectFit: "cover",
            margin: "5px 0 -90px 0",
            display: "block",
            marginLeft: "-250px",
          }}
        />

        <div style={{ marginBottom: "-100px", position: "relative" }}>
          <Image
            src="/hellrosa-welle.png"
            alt=""
            width={1400}
            height={100}
            style={{
              width: "80%",
              height: "auto",
              objectFit: "cover",
              display: "block",
              transform: "rotate(90deg) translateX(20%) translateY(30px)",
              transformOrigin: "left top",
            }}
          />

            <Image
            src="/gelbe-welle.png"
            alt=""
            width={1400}
            height={100}
            style={{
            width: "100%",
            height: "auto",
            objectFit: "cover",
            display: "block",
            }}
         />
   
          <div style={{ position: "relative" }}>
            <div
              style={{
                backgroundColor: "white",
                padding: "40px 50px",
                margin: "0 20px",
              }}
            >
              <h1
                style={{
                  fontSize: "32px",
                  fontWeight: "600",
                  color: "#111827",
                  marginBottom: "8px",
                  textAlign: "center",
                }}
              >
                Fall bearbeiten
              </h1>
              <p
                style={{
                  fontSize: "14px",
                  color: "#6b7280",
                  textAlign: "center",
                  margin: 0,
                }}
              >
                Geben Sie die ID des Falls ein, den Sie bearbeiten möchten.
              </p>
            </div>

            <Image
              src="/rosa-welle.png"
              alt=""
              width={1400}
              height={100}
              style={{
                width: "80%",
                height: "auto",
                objectFit: "cover",
                display: "block",
                transform: "rotate(270deg) translateX(50%) translateY(150px)",
                transformOrigin: "right top",
              }}
            />
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ position: "relative" }}>
            <div
              style={{
                backgroundColor: "white",
                padding: "20px 20px",
                margin: "0 20px",
              }}
            >
              <label
                style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#374151",
                  marginBottom: "8px",
                }}
              >
                Fall-ID
              </label>

              <input
                type="number"
                value={fallId}
                onChange={(e) => setFallId(e.target.value)}
                style={{
                  width: "100%",
                  border: "2px solid #d1d5db",
                  borderRadius: "8px",
                  padding: "12px",
                  fontSize: "16px",
                  marginBottom: "20px",
                  boxSizing: "border-box",
                }}
                min="1"
                placeholder="z.B. 42"
              />

              <button
                type="submit"
                style={{
                  width: "100%",
                  backgroundColor: "transparent",
                  color: "#131313",
                  border: "4px solid #aeaa9e2f",
                  borderRadius: "8px",
                  padding: "12px 16px",
                  fontSize: "18px",
                  fontWeight: "500",
                  cursor: "pointer",
                }}
              >
                Fall öffnen
              </button>
            </div>
          </div>

          <Image
            src="/blaue-welle.png"
            alt=""
            width={1400}
            height={100}
            style={{
              width: "100%",
              height: "auto",
              objectFit: "cover",
              transform: "scaleY(-1)",
              display: "block",
            }}
          />
        </form>
      </div>
    </div>
  );
}