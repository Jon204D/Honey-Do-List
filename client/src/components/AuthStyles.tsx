import React from "react";

export const AuthInput = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    {...props}
    style = {{
      color: "orange",
      padding: "10px",
      borderRadius: "5px",
      border: "1px solid orange",
      backgroundColor: "#212121",
      ...props.style, 
    }}
  />
)

export const AuthButton = ({
  variant = "primary",
  ...props
}: {variant?: "primary" | "secondary"} & React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    {...props}
    style = {{
      padding: "10px",
      cursor: "pointer",
      fontWeight: "bold",
      borderRadius: "5px",
      ...(variant === "primary"
        ? {backgroundColor: "orange", color: "#212121", border: "none"}
        : {backgroundColor: "#212121", color: "orange", border: "1px solid orange"}),
      ...props.style,
    }}
  />
)