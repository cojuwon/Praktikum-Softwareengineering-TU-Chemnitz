import Link from "next/link";
import React from "react";

type Props = {
  href: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
};

export default function PrimaryButton({ href, children, style }: Props) {
  const base: React.CSSProperties = {
    backgroundColor: "#42446F",
    color: "white",
    padding: "12px 24px",
    borderRadius: "8px",
    textDecoration: "none",
    fontWeight: 500,
    fontSize: 16,
    transition: "transform 0.1s",
    display: "inline-block",
    textAlign: "center",
    minWidth: "160px",
  };

  return (
    <Link href={href} style={{ ...base, ...style }}>
      {children}
    </Link>
  );
}
