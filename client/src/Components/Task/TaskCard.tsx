import React, { useState, useEffect } from "react";
import { Task } from "./TaskBoard";
import { AuthButton } from "../Auth/AuthStyles";

interface Props {
  task: Task;
  onDelete: (id: string) => void;
}

interface CommentData {
  _id: string;
  content: string;
}

const API_BASE = "http://localhost:5001"; 

const TaskCard: React.FC<Props> = ({ task, onDelete }) => {
  
  const defaultReactions = {
    "👍": 0,
    "❤️": 0,
    "🎉": 0,
    "🐝": 0,
    "🍯": 0,
  };

  const [reactions, setReactions] = useState<{ [key: string]: number }>(defaultReactions);
  const [comments, setComments] = useState<CommentData[]>([]); 
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    if (!task?._id) return;

    // 1. Fetch Comments
    fetch(`${API_BASE}/api/comments/task/${task._id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch comments");
        return res.json();
      })
      .then((data) => setComments(data))
      .catch((err) => console.error("Error fetching comments:", err));

    // 2. Fetch Reactions
    fetch(`${API_BASE}/api/reactions/task/${task._id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch reactions");
        return res.json();
      })
      .then((data) => {
        setReactions((prev) => ({ ...prev, ...data }));
      })
      .catch((err) => console.error("Error fetching reactions:", err));
  }, [task?._id]);

  const handleAddReaction = async (emoji: string) => {
    if (!task?._id) return;
    try {
      setReactions((prev) => ({ ...prev, [emoji]: (prev[emoji] || 0) + 1 }));

      await fetch(`${API_BASE}/api/reactions/task/${task._id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emoji }),
      });
    } catch (error) {
      console.error("Failed to add reaction", error);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !task?._id) return;

    try {
      const res = await fetch(`${API_BASE}/api/comments/task/${task._id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newComment }),
      });

      if (res.ok) {
        const savedComment: CommentData = await res.json();
        setComments((prev) => [...prev, savedComment]);
        setNewComment("");
      } else {
        console.error("Server responded with error:", await res.text());
      }
    } catch (error) {
      console.error("Failed to add comment", error);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/comments/${commentId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setComments((prev) => prev.filter((c) => c._id !== commentId));
      }
    } catch (error) {
      console.error("Failed to delete comment", error);
    }
  };

  if (!task) return null;

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();

  return (
    <div
      data-tour="task-card"
      style={{
        backgroundColor: "#212121",
        color: "orange",
        borderRadius: "8px",
        padding: "1rem",
        boxShadow: "0 0 10px rgba(0,0,0,0.4)",
      }}
    >
      <h3 style={{ margin: "0 0 0.5rem 0" }}>{task.title}</h3>
      <p style={{ margin: "0 0 0.5rem 0" }}>{task.description}</p>
      <small>Status: {task.status}</small>
      <br />
      <small>Priority: {task.priority}</small>
      <br />
      <small>Due: {task.dueDate ? task.dueDate : "N/A"}</small>
      <div style={{ marginTop: "0.5rem" }}>
        <AuthButton
          variant="secondary"
          onClick={() => onDelete(task._id!)}
          style={{ marginLeft: "10px" }}
        >
          Delete
        </AuthButton>
      </div>

      {/* Reactions Section */}
      <div
        style={{
          paddingTop: "1rem",
          marginTop: "1rem",
          borderTop: "1px solid #444",
        }}
      >
        <h5 style={{ margin: "0 0 0.5rem 0", color: "#ccc" }}>Reactions</h5>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          {Object.entries(reactions).map(([emoji, count]) => (
            <button
              key={emoji}
              onClick={() => handleAddReaction(emoji)}
              style={{
                background: "#333",
                border: "1px solid #555",
                borderRadius: "16px",
                padding: "0.25rem 0.5rem",
                cursor: "pointer",
                color: "#fff",
                fontSize: "0.8rem",
              }}
            >
              {emoji} {count > 0 && <span>{count}</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Comments Section */}
      <div
        style={{
          paddingTop: "1rem",
          marginTop: "1rem",
          borderTop: "1px solid #444",
        }}
      >
        <h5 style={{ margin: "0 0 0.5rem 0", color: "#ccc" }}>Comments</h5>

        {/* List of existing comments */}
        <div style={{ maxHeight: "100px", overflowY: "auto", marginBottom: "0.5rem" }}>
          {comments.length === 0 && (
            <small style={{ color: "#888" }}>No comments yet.</small>
          )}
          {comments.map((comment) => (
            <div
              key={comment._id}
              style={{
                background: "#333",
                borderRadius: "4px",
                padding: "0.5rem",
                margin: "0.25rem 0",
                color: "#ddd",
                fontSize: "0.9rem",
                wordBreak: "break-word",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span>{comment.content}</span>
              <button
                onClick={() => handleDeleteComment(comment._id)}
                style={{
                  background: "#dc3545",
                  color: "#fff",
                  border: "none",
                  borderRadius: "4px",
                  padding: "0.2rem 0.6rem",
                  cursor: "pointer",
                  marginLeft: "8px",
                  fontSize: "0.8rem",
                  transition: "background-color 0.2s ease-in-out",
                }}
                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#c82333")}
                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#dc3545")}
              >
                Delete
              </button>
            </div>
          ))}
        </div>

        {/* Add new comment input */}
        <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleAddComment();
              }
            }}
            placeholder="Add a comment..."
            style={{
              flex: 1,
              background: "#111",
              border: "1px solid #555",
              borderRadius: "4px",
              padding: "0.5rem",
              color: "#fff",
            }}
          />
          <AuthButton variant="primary" onClick={handleAddComment}>
            Add
          </AuthButton>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;