import React from "react";
import {Task} from "./TaskBoard";
import {AuthButton} from "../Auth/AuthStyles";

interface Props {
  task: Task;
  onDelete: (id: string) => void;
}

const TaskCard: React.FC<Props> = ({task, onDelete}) => {
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();

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
    </div>
  )
}

export default TaskCard;