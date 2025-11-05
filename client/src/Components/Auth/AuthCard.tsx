import React from "react";

interface AuthCardProps {
  title: string;                  // Heading at the top of the card
  children: React.ReactNode;      // Contents inside the card (inputs, buttons)
}

/* Orange background with black card in the middle */
const AuthCard: React.FC<AuthCardProps> = ({ title, children }) => {
  return (
    <div
      style={{
        top: "50%",
        left: "50%",
        width: 360,                 // slightly wider for nicer spacing
        padding: 30,
        color: "orange",
        position: "fixed",
        textAlign: "center",
        borderRadius: 10,
        backgroundColor: "#212121",
        transform: "translate(-50%, -50%)",
        boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
      }}
    >
      <h2 style={{ margin: "0 0 15px 0" }}>{title}</h2>
      {children}
    </div>
  );
};

export default AuthCard;