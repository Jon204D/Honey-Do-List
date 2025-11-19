import React from "react";

/* Read-only display of email */
const EmailDisplay: React.FC<{ email: string }> = ({ email }) => {
  return (
    <div style={{display: "flex", flexDirection: "column", gap: 6, textAlign: "left"}}>
      <label style={{fontWeight: "bold", color: "orange"}}>Email</label>
      <p style={{margin: 0}}>{email}</p>
    </div>
  );
};

export default EmailDisplay;