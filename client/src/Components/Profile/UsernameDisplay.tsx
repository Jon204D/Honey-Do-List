import { useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { AuthButton } from "../Auth/AuthStyles";

interface Props {
  username: string;                                                 // Current saved username
  password: string;                                                 // Current saved password
  isSubmitting: boolean;
  saveUser: (newUsername: string, newPassword: string, onSuccess?: () => void) => void;   // Saves updated user info
}

/* Displaying & Editing Username 
   - View Mode - shows username & "Reset Username" button
   - Edit Mode - shows input field & save/cancel buttons */
const UsernameDisplay: React.FC<Props> = ({username, password, saveUser, isSubmitting}) => {
  const [editingUsername, setEditingUsername] = useState(false);    // Toggles between edit & view mode
  const [tempUsername, setTempUsername] = useState(username);       // Temporary input (in case user does not save)
  const navigate = useNavigate();

  /* Keeps tempUsername updated when parent username changes */
  useEffect(() => {
    setTempUsername(username);
  }, [username]);

  return (
    <div style={{display: "flex", flexDirection: "column", gap: 6, textAlign: "left"}}>
      <label style={{fontWeight: "bold", color: "orange"}}>Username</label>

      {editingUsername ? (
        <>
          {/* Edit Mode */}
          <input
            type="text"
            value={tempUsername}
            onChange={(e) => setTempUsername(e.target.value)}
            style={{width: "80%", padding: 8, color: "orange", marginTop: 5, borderRadius: 5, backgroundColor: "#222", border: "1px solid orange"}}
          />
          <div style={{marginTop: 10, display: "flex", gap: 10}}>
            <AuthButton
              onClick={() =>
                saveUser(tempUsername, password, () => {
                  setEditingUsername(false);
                  navigate("/settings", {state: {message: "Username updated!"}});
                })
              }
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save"}
            </AuthButton>

            <AuthButton
              onClick={() => setEditingUsername(false)}
              variant="secondary"
              disabled={isSubmitting}
            >
              Cancel
            </AuthButton>
          </div>
        </>
      ) : (
        <div style={{display: "flex", alignItems: "center", gap: 10, justifyContent: "space-between"}}>
          <p style={{fontWeight: "normal", margin: 0 }}>{username}</p>
          <AuthButton onClick={() => setEditingUsername(true)} variant="secondary">
            Reset Username
          </AuthButton>
        </div>
      )}
    </div>
  )
}

export default UsernameDisplay;