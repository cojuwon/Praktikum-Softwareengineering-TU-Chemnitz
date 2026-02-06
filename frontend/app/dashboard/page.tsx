import Link from 'next/link';

import Image from 'next/image';

export default function Page() {
  return (
    <div
      className="flex flex-col justify-between h-full bg-[#F3EEEE] overflow-auto"
    >
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
        </div>
        <div className="flex items-center justify-center p-6 md:w-3/5 md:px-28 md:py-12">

        </div>
      </div>

      <Image
        src="/drei-welle-zusammenblau.png"
        alt=""
        width={1400}
        height={100}
        className="w-full h-auto object-cover block"
      />
    </div>
  );
}