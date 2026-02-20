import Image from "next/image";
import React from "react";

type Props = {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  imageMargin?: string;
  showImage?: boolean;
};

export default function PageHeader({ title, subtitle, imageMargin = "60px auto 20px auto", showImage = true }: Props) {
  return (
    <>
      {showImage && (
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
            margin: imageMargin,
          }}
        />
      )}

      <h1
        style={{
          fontSize: 28,
          fontWeight: 600,
          color: "#42446F",
          marginBottom: subtitle ? 10 : 30,
          textAlign: "center",
        }}
      >
        {title}
      </h1>

      {subtitle && (
        <p
          style={{
            fontSize: 16,
            color: "#6b7280",
            textAlign: "center",
            marginBottom: 30,
            maxWidth: "600px",
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          {subtitle}
        </p>
      )}
    </>
  );
}
