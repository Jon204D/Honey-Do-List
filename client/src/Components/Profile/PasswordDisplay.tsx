import { useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { AuthButton } from "../Auth/AuthStyles";

interface Props {
  isSubmitting: boolean;
  changePassword: (
    payload: { currentPassword: string; newPassword: string },
    onSuccess?: () => void
  ) => void;
}

/* Displaying & Editing Password 
   - View Mode - shows hidden password & "Reset Password" button
   - Edit Mode - shows input field & save/cancel buttons 
   - Toggle to show/hide password */
const PasswordDisplay: React.FC<Props> = ({isSubmitting, changePassword}) => {
  const [editingPassword, setEditingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const navigate = useNavigate();

  const resetFields = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setLocalError(null);
  };

  const handleSave = () => {
    setLocalError(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setLocalError("Please fill out all password fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setLocalError("New passwords do not match.");
      return;
    }

    changePassword(
      { currentPassword, newPassword },
      () => {
        // On success
        resetFields();
        setEditingPassword(false);
        navigate("/settings", { state: { message: "Password updated!" } });
      }
    );
  };

  return (
    <div
      style={{display: "flex", flexDirection: "column", gap: 6, textAlign: "left"}}
    >
      <label style={{ fontWeight: "bold", color: "orange" }}>Password</label>

      {editingPassword ? (
        <>
          <input
            type="password"
            placeholder="Current password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            style={{width: "80%", padding: 8, marginTop: 5, border: "1px solid orange", backgroundColor: "#222", color: "orange", borderRadius: 5}}
          />

          <input
            type="password"
            placeholder="New password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            style={{width: "80%", padding: 8, marginTop: 8, border: "1px solid orange", backgroundColor: "#222", color: "orange", borderRadius: 5}}
          />

          <input
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            style={{width: "80%", padding: 8, marginTop: 8, border: "1px solid orange", backgroundColor: "#222", color: "orange", borderRadius: 5}}
          />

          {localError && (
            <small style={{ color: "salmon", marginTop: 6 }}>
              {localError}
            </small>
          )}

          <div style={{ marginTop: 10, display: "flex", gap: 10 }}>
            <AuthButton
              onClick={handleSave}
              disabled={
                isSubmitting ||
                !currentPassword ||
                !newPassword ||
                !confirmPassword
              }
            >
              {isSubmitting ? "Saving..." : "Save"}
            </AuthButton>

            <AuthButton
              onClick={() => {
                resetFields();
                setEditingPassword(false);
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
          style={{display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10}}
        >
          <p style={{ margin: 0, fontWeight: "normal" }}>********</p>

          <AuthButton
            onClick={() => setEditingPassword(true)}
            variant="secondary"
          >
            Change Password
          </AuthButton>
        </div>
      )}
    </div>
  );
};

export default PasswordDisplay;