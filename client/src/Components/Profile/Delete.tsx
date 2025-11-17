import React, {useState} from "react";
import {AuthButton} from "../Auth/AuthStyles";

interface DeleteProps {
  userId: string;
  clearAllAndGoHome: (msg: string) => void;
  setFormMessage: (msg: string | null) => void;
}

const Delete: React.FC<DeleteProps> = ({userId, clearAllAndGoHome, setFormMessage}) => {
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    if (confirmText !== "DELETE") return;
    setIsDeleting(true);
    setFormMessage(null);

    try {
      const token = localStorage.getItem("authToken");
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      if (userId) {
        const res = await fetch(`${process.env.REACT_APP_BACKEND_BASE_URL}api/users/user/${userId}`, {
           method: "DELETE", headers, credentials: "include" }
        )

        if (!(res.status === 200 || res.status === 204 || res.ok)) {
          let errMsg = "Failed to delete account";
          try {
            const err = await res.json();
            errMsg = err.message || errMsg;
          } catch {}
          setFormMessage(errMsg);
          setIsDeleting(false);
          return;
        }
      }

      clearAllAndGoHome("Account deleted successfully.");
    } catch (e) {
      console.error("Delete failed:", e);
      clearAllAndGoHome("Account deleted locally.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div
      style={{textAlign: "left"}}
    >
      {!confirmingDelete ? (
        <div style={{display: "flex", alignItems: "center", gap: 12}}>
          <AuthButton
            variant="primary"
            onClick={() => setConfirmingDelete(true)}
            style={{backgroundColor: "#c0392b", color: "#fff"}}
          >
            Delete Account
          </AuthButton>
        </div>
      ) : (
        <div style={{display: "flex", flexDirection: "column", gap: 10}}>
          <p style={{margin: 0, color: "#ffb938"}}>
            This action is permanent. Type <b>DELETE</b> to confirm.
          </p>

          <input
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder='Type "DELETE"'
            style={{width: "80%", padding: 8, color: "orange", borderRadius: 5, backgroundColor: "#222", border: "1px solid orange"}}
            disabled={isDeleting}
          />

          <div style={{display: "flex", gap: 10}}>
            <AuthButton
              variant="primary"
              onClick={handleDeleteAccount}
              disabled={confirmText !== "DELETE" || isDeleting}
              style={{
                backgroundColor:
                  confirmText === "DELETE" && !isDeleting ? "#c0392b" : "#7f8c8d",
                color: "#fff",
              }}
            >
              {isDeleting ? "Deleting..." : "Confirm Delete"}
            </AuthButton>

            <AuthButton
              variant="secondary"
              onClick={() => {
                setConfirmingDelete(false);
                setConfirmText("");
              }}
              disabled={isDeleting}
            >
              Cancel
            </AuthButton>
          </div>
        </div>
      )}
    </div>
  )
}

export default Delete;