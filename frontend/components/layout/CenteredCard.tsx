import React from "react";

type Props = {
  header?: React.ReactNode;
  children: React.ReactNode;
  cardStyle?: React.CSSProperties;
  containerStyle?: React.CSSProperties;
};

export default function CenteredCard({ header, children, cardStyle, containerStyle }: Props) {
  return (
    <div
      style={{
        maxWidth: "700px",
        margin: "0 auto",
        width: "100%",
        padding: "24px 24px 0 24px",
        ...containerStyle,
      }}
    >
      {header}

      <div
        style={{
          backgroundColor: "white",
          padding: "40px",
          margin: "0 20px",
          borderRadius: "12px",
          boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
          ...cardStyle,
        }}
      >
        {children}
      </div>
    </div>
  );
}
