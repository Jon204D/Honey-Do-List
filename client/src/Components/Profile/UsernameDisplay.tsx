import { useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { AuthButton } from "../Auth/AuthStyles";

interface Props {
  username: string;   // Current saved username   
  isSubmitting: boolean;
  saveUser: (updates: {username?: string}, onSuccess?: () => void) => void;
}

/* Displaying & Editing Username 
   - View Mode - shows username & "Reset Username" button
   - Edit Mode - shows input field & save/cancel buttons */
const UsernameDisplay: React.FC<Props> = ({username, saveUser, isSubmitting}) => {
  const [editingUsername, setEditingUsername] = useState(false);
  const [tempUsername, setTempUsername] = useState(username);
  const navigate = useNavigate();

  /* Keeps tempUsername updated when parent username changes */
  useEffect(() => {
    setTempUsername(username);
  }, [username])

  const handleSave = () => {
    if (!tempUsername.trim()) return;
    saveUser(
      { username: tempUsername.trim() },
      () => {
        setEditingUsername(false);
        navigate("/settings", { state: { message: "Username updated!" } });
      }
    );
  };

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
          <div style={{ marginTop: 10, display: "flex", gap: 10}}>
            <AuthButton
              onClick={handleSave}
              disabled={isSubmitting || !tempUsername.trim()}
            >
              {isSubmitting ? "Saving..." : "Save"}
            </AuthButton>

            <AuthButton
              onClick={() => {
                setEditingUsername(false);
                setTempUsername(username); // reset to original
              }}
              variant="secondary"
              disabled={isSubmitting}
            >
              Cancel
            </AuthButton>
          </div>
        </>
      ) : (
        <div
          style={{display: "flex", alignItems: "center", gap: 10, justifyContent: "space-between"}}
        >
          <p style={{fontWeight: "normal", margin: 0}}>{username}</p>
          <AuthButton 
          onClick={() => setEditingUsername(true)}
            variant="secondary"
          >
            Reset Username
          </AuthButton>
        </div>
      )}
    </div>
  )
}

export default UsernameDisplay;