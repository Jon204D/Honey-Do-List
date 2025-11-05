import { useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { AuthButton } from "../Auth/AuthStyles";

interface Props {
  username: string;            // Current saved username   
  password: string;            // Current saved password   
  isSubmitting: boolean;
  saveUser: (newUsername: string, newPassword: string, onSuccess?: () => void) => void;   // Saves updated user info
}

/* Displaying & Editing Password 
   - View Mode - shows hidden password & "Reset Password" button
   - Edit Mode - shows input field & save/cancel buttons 
   - Toggle to show/hide password */
const PasswordDisplay: React.FC<Props> = ({username, password, saveUser, isSubmitting}) => {
  const [editingPassword, setEditingPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [tempPassword, setTempPassword] = useState(password);
  const navigate = useNavigate();

  /* Keeps tempPassword updated when parent password changes */
  useEffect(() => {
    setTempPassword(password);
  }, [password]);

  return (
    <div style={{display: "flex", flexDirection: "column", gap: 6, textAlign: "left"}}>
      <label style={{fontWeight: "bold", color: "orange" }}>Password</label>

      {editingPassword ? (
        <>
          {/* Edit Mode */}
          <input
            type="text"   // Not hidden so the user sees what they type
            value={tempPassword}
            onChange={(e) => setTempPassword(e.target.value)}
            style={{width: "80%", padding: 8, marginTop: 5, border: "1px solid orange", backgroundColor: "#222", color: "orange", borderRadius: 5}}
          />
          <div style={{marginTop: 10, display: "flex", gap: 10}}>
            <AuthButton
              onClick={() =>
                saveUser(username, tempPassword, () => {
                  setEditingPassword(false);
                  navigate("/settings", {state: {message: "Password updated!"}});
                })
              }
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save"}
            </AuthButton>

            <AuthButton
              onClick={() => setEditingPassword(false)}
              variant="secondary"
              disabled={isSubmitting}
            >
              Cancel
            </AuthButton>
          </div>
        </>
      ) : (
        <>
          <div style={{display: "flex", alignItems: "center", gap: 10, justifyContent: "space-between"}}>
            <p
              style={{fontWeight: "normal", margin: 0, cursor: "pointer", userSelect: "none"}}
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? password : "••••••••"}
            </p>

            <AuthButton onClick={() => setEditingPassword(true)} variant="secondary">
              Reset Password
            </AuthButton>
          </div>

          <small style={{color: "orange"}}>
            {showPassword ? "Click to hide" : "Click to show"}
          </small>
        </>
      )}
    </div>
  );
};

export default PasswordDisplay;