import React, { useState } from "react";

interface ResetPasswordProps {
  password: string;
  onCancel: () => void;
  onSave: (newPassword: string) => void;
}

const ResetPassword: React.FC<ResetPasswordProps> = ({password, onCancel, onSave}) => {
  const [newPassword, setNewPassword] = useState(password);

  return (
    <div>

      <input
        type="text"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        style = {{ 
          width: "100%", 
          padding: "8px", 
          marginTop: "5px" 
        }}
      />

      <div 
        style = {{ 
          marginTop: "10px", 
          display: "flex", 
          gap: "10px" 
        }}
      >
        <button onClick={() => onSave(newPassword)}>Save</button>
        <button onClick={onCancel}>Cancel</button>
      </div>

    </div>
  )
}

export default ResetPassword;