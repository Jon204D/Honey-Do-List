import React, { useState } from "react";
import {Task} from "./TaskBoard";
import {AuthButton} from "../Auth/AuthStyles";

interface Props {
  task: Task;
  onDelete: (id: string) => void;
}

const TaskCard: React.FC<Props> = ({task, onDelete}) => {
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();

  const [reactions, setReactions] = useState<{ [key: string]: number }>({
    "👍": 0,
    "❤️": 0,
    "🎉": 0,
    "🐝": 0, 
    "🍯": 0, 
  });

  const [comments, setComments] = useState<string[]>([]);
  const [newComment, setNewComment] = useState("");

  const handleAddReaction = (emoji: string) => {
    setReactions(prevReactions => ({
      ...prevReactions,
      [emoji]: (prevReactions[emoji] || 0) + 1,
    }));
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      setComments(prevComments => [...prevComments, newComment]);
      setNewComment("");
    }
  };

  return (
    <div
      data-tour="task-card" 
      style = {{
        backgroundColor: "#212121",
        color: "orange",
        borderRadius: "8px",
        padding: "1rem",
        boxShadow: "0 0 10px rgba(0,0,0,0.4)",
      }}
    >
      <h3 style = {{margin: "0 0 0.5rem 0"}}>{task.title}</h3>
      <p style = {{margin: "0 0 0.5rem 0"}}>{task.description}</p>      
      <small>Status: {task.status}</small>
      <br/>
      <small>Priority: {task.priority}</small>
      <br/>
      <small>Due: {task.dueDate ? task.dueDate : "N/A"}</small>
      <div style={{marginTop: "0.5rem"}}>
        <AuthButton
          variant="secondary"
          onClick={() => onDelete(task._id!)}
          style={{marginLeft: "10px"}}
        >
          Delete
        </AuthButton>
      </div>
      
      {/* Reactions Section */}
      <div style={{ 
        paddingTop: "1rem", 
        marginTop: "1rem", 
        borderTop: "1px solid #444" 
      }}>
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
      <div style={{ 
        paddingTop: "1rem", 
        marginTop: "1rem", 
        borderTop: "1px solid #444" 
      }}>
        <h5 style={{ margin: "0 0 0.5rem 0", color: "#ccc" }}>Comments</h5>
        
        {/* List of existing comments */}
        <div style={{ maxHeight: "100px", overflowY: "auto", marginBottom: "0.5rem" }}>
          {comments.length === 0 && (
            <small style={{ color: "#888" }}>No comments yet.</small>
          )}
          {comments.map((comment, index) => (
            <p key={index} style={{
              background: "#333",
              borderRadius: "4px",
              padding: "0.5rem",
              margin: "0.25rem 0",
              color: "#ddd",
              fontSize: "0.9rem",
              wordBreak: "break-word",
            }}>
              {comment}
            </p>
          ))}
        </div>

        {/* Add new comment input */}
        <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)} 
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
  )
}

export default TaskCard;