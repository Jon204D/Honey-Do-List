import React, {useState} from "react";
import {AuthButton, AuthInput} from "../Auth/AuthStyles";
import {Task} from "./TaskBoard";

interface Props {
  onClose: () => void;
  onSave: (task: Task) => void;
}

const TaskModal: React.FC<Props> = ({onClose, onSave}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("");
  const [status, setStatus] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !priority) return;

    setIsSubmitting(true);
    try {
      await onSave({title, description, priority, dueDate, status: status || "pending"});
    } finally {
      setIsSubmitting(false);
      onClose();
    }
  }

  return (  
    <div
      data-tour="task-modal"
      style = {{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0,0,0,0.6)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <form
        onSubmit={handleSubmit}
        style = {{
          backgroundColor: "#212121",
          color: "orange",
          padding: "2rem",
          borderRadius: "15px",
          width: "500px",
          boxShadow: "0 0 20px rgba(0, 0, 0, 0.62)",
          textAlign: "left",
        }}
      >
         <div
          style={{
            fontSize: "1.8rem",
            fontWeight: 600,
            marginBottom: "1rem",
          }}
        >
          Create Task
        </div>

        {/* Title */}
        <input
          data-tour="task-title"
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          style = {{
            width: "97%",
            padding: "8px",
            marginBottom: "10px",
            border: "1px solid orange",
            backgroundColor: "#222",
            color: "orange",
            borderRadius: "5px",
          }}
        />

        {/* Description */}
        <textarea
          data-tour="task-desc"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          style = {{
            width: "97%",
            height: "100px",
            padding: "8px",
            marginBottom: "10px",
            border: "1px solid orange",
            backgroundColor: "#222",
            color: "orange",
            borderRadius: "5px",
            resize: "none",
          }}
        />

        {/* Status - FIXED: Changed values to lowercase */}
        <select
          data-tour="task-status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          required
          style = {{
            width: "100%",
            padding: "8px",
            marginBottom: "10px",
            border: "1px solid orange",
            backgroundColor: "#222",
            color: priority ? "orange" : "orange", 
            borderRadius: "5px",
            appearance: "none", 
          }}
        >
          <option value="">Select Status</option>
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>

         {/* Priority - FIXED: Changed values to lowercase */}
         <select
          data-tour="task-priority"
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          required
          style = {{
            width: "100%",
            padding: "8px",
            marginBottom: "10px",
            border: "1px solid orange",
            backgroundColor: "#222",
            color: priority ? "orange" : "orange", 
            borderRadius: "5px",
            appearance: "none", 
          }}
        >
          <option value="">Select Priority</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>

        <AuthInput
          data-tour="task-date" 
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          style={{marginBottom: "1rem"}}
        />

        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <AuthButton data-tour="create-task" type="submit" disabled={isSubmitting || !title || !description || !priority}
          >
            {isSubmitting ? "Saving..." : "Save"}
          </AuthButton>
          <AuthButton type="button" onClick={onClose}
            variant="secondary"
            disabled={isSubmitting}
          >
            Cancel
          </AuthButton>
        </div>
      </form>
    </div>
  )
}

export default TaskModal;